import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import {
  ApiClientConfig,
  ApiError,
  ApiResponse,
  RequestCallbacks,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  QueryParams,
} from '../types/types'

/**
 * Cliente HTTP para requisições API com tratamento de erros e respostas padronizadas.
 * Fornece uma interface simplificada para realizar requisições HTTP com tratamento automático
 * de erros e padronização de respostas, incluindo suporte a interceptadores.
 * 
 * @example
 * ```typescript
 * // Criando uma instância do cliente
 * const api = new ApiClient({
 *   baseURL: 'https://api.exemplo.com',
 *   timeout: 5000,
 *   headers: {
 *     'Authorization': 'Bearer seu-token'
 *   }
 * })
 * 
 * // Adicionando interceptador de requisição para token dinâmico
 * api.addRequestInterceptor((config) => {
 *   const token = getToken()
 *   if (token) {
 *     config.headers = {
 *       ...config.headers,
 *       Authorization: `Bearer ${token}`
 *     }
 *   }
 *   return config
 * })
 * 
 * // Exemplo de GET com callbacks
 * api.get('/usuarios', {
 *   onSuccess: (response) => {
 *     console.log('Dados:', response.data)
 *     console.log('Status:', response.status)
 *     console.log('Mensagem:', response.message)
 *   },
 *   onError: (error) => {
 *     console.error('Erro:', error.message)
 *     console.error('Status:', error.status)
 *     console.error('Detalhes:', error.details)
 *   }
 * })
 * 
 * // Exemplo de POST com dados
 * const novoUsuario = {
 *   nome: 'João Silva',
 *   email: 'joao@exemplo.com'
 * }
 * 
 * api.post('/usuarios', novoUsuario, {
 *   onSuccess: (response) => console.log('Usuário criado:', response.data),
 *   onError: (error) => console.error('Erro ao criar usuário:', error.message)
 * })
 * ```
 */
export class ApiClient {
  private api: AxiosInstance
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  /**
   * Cria uma nova instância do cliente API
   * @param config Configurações do cliente
   * @param config.baseURL URL base para todas as requisições
   * @param config.timeout Tempo limite em milissegundos (padrão: 10000)
   * @param config.headers Headers customizados para todas as requisições
   */
  constructor(config: ApiClientConfig) {
    this.api = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    })
  }

  /**
   * Adiciona um interceptador de requisição.
   * Permite modificar a configuração da requisição antes do envio.
   * 
   * @param interceptor Função que recebe e retorna a configuração da requisição
   * 
   * @example
   * ```typescript
   * api.addRequestInterceptor((config) => {
   *   const token = storage.getToken()
   *   if (token) {
   *     config.headers = {
   *       ...config.headers,
   *       Authorization: `Bearer ${token}`
   *     }
   *   }
   *   return config
   * })
   * ```
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Adiciona um interceptador de resposta.
   * Permite processar a resposta antes de retorná-la para o callback.
   * 
   * @param interceptor Função que recebe e retorna a resposta processada
   * 
   * @example
   * ```typescript
   * api.addResponseInterceptor((response) => {
   *   console.log('Resposta interceptada:', response.status)
   *   return {
   *     ...response,
   *     message: `[${new Date().toISOString()}] ${response.message}`
   *   }
   * })
   * ```
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Adiciona um interceptador de erro.
   * Permite processar erros antes de retorná-los para o callback.
   * 
   * @param interceptor Função que recebe um erro e retorna erro processado ou nova resposta
   * 
   * @example
   * ```typescript
   * api.addErrorInterceptor(async (error) => {
   *   if (error.status === 401) {
   *     await refreshToken()
   *     // Pode retornar um novo ApiResponse ou o erro processado
   *     return {
   *       ...error,
   *       message: 'Token renovado automaticamente'
   *     }
   *   }
   *   return error
   * })
   * ```
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  /**
   * Remove um interceptador de requisição específico.
   * @param interceptor Interceptador a ser removido
   */
  removeRequestInterceptor(interceptor: RequestInterceptor): void {
    const index = this.requestInterceptors.indexOf(interceptor)
    if (index > -1) {
      this.requestInterceptors.splice(index, 1)
    }
  }

  /**
   * Remove um interceptador de resposta específico.
   * @param interceptor Interceptador a ser removido
   */
  removeResponseInterceptor(interceptor: ResponseInterceptor): void {
    const index = this.responseInterceptors.indexOf(interceptor)
    if (index > -1) {
      this.responseInterceptors.splice(index, 1)
    }
  }

  /**
   * Remove um interceptador de erro específico.
   * @param interceptor Interceptador a ser removido
   */
  removeErrorInterceptor(interceptor: ErrorInterceptor): void {
    const index = this.errorInterceptors.indexOf(interceptor)
    if (index > -1) {
      this.errorInterceptors.splice(index, 1)
    }
  }

  /**
   * Remove todos os interceptadores.
   */
  clearInterceptors(): void {
    this.requestInterceptors = []
    this.responseInterceptors = []
    this.errorInterceptors = []
  }

  /**
   * Aplica todos os interceptadores de requisição à configuração.
   * @param config Configuração inicial da requisição
   * @returns Configuração processada pelos interceptadores
   * @internal
   */
  private applyRequestInterceptors(config: RequestConfig): RequestConfig {
    return this.requestInterceptors.reduce(
      (processedConfig, interceptor) => interceptor(processedConfig),
      config
    )
  }

  /**
   * Aplica todos os interceptadores de resposta.
   * @param response Resposta original
   * @returns Resposta processada pelos interceptadores
   * @internal
   */
  private applyResponseInterceptors<T>(response: ApiResponse<T>): ApiResponse<T> {
    return this.responseInterceptors.reduce(
      (processedResponse, interceptor) => interceptor(processedResponse),
      response
    )
  }

  /**
   * Aplica todos os interceptadores de erro.
   * @param error Erro original
   * @returns Erro processado ou nova resposta
   * @internal
   */
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError | ApiResponse<unknown>> {
    let processedError: ApiError | ApiResponse<unknown> = error

    for (const interceptor of this.errorInterceptors) {
      try {
        const result = await interceptor(error)
        processedError = result
        // Se um interceptador retornar uma ApiResponse, para o processamento
        if ('data' in result) {
          break
        }
      } catch (interceptorError) {
        // Se um interceptador falhar, continua com o próximo
        console.warn('Erro no interceptador de erro:', interceptorError)
      }
    }

    return processedError
  }

  /**
   * Extrai e padroniza os dados de erro do Axios
   * @param error Erro original do Axios
   * @returns Objeto de erro padronizado
   * @internal
   */
  private extractErrorData(error: AxiosError): ApiError {
    return {
      message:
        (error.response?.data as { message?: string })?.message ||
        'Ocorreu um erro na requisição',
      status: error.response?.status || 500,
      code: error.code,
      details: error.response?.data,
    }
  }

  /**
   * Extrai e padroniza os dados da resposta do Axios
   * @param response Resposta original do Axios
   * @returns Objeto de resposta padronizado
   * @internal
   */
  private extractResponseData<T>(response: AxiosResponse<T>): ApiResponse<T> {
    const responseData = response.data as { message?: string }
    return {
      data: response.data,
      status: response.status,
      message: responseData.message || 'Operação realizada com sucesso',
    }
  }

  /**
   * Realiza uma requisição GET
   * @param url Caminho da requisição (será concatenado com baseURL)
   * @param paramsOrCallbacks Parâmetros de query string ou objeto com callbacks
   * @param callbacks Objeto com callbacks de sucesso e erro (opcional se parâmetros forem fornecidos)
   * 
   * @example
   * ```typescript
   * // GET simples
   * api.get('/usuarios/1', {
   *   onSuccess: (response) => console.log('Usuário:', response.data),
   *   onError: (error) => console.error('Erro:', error.message)
   * })
   * 
   * // GET com parâmetros
   * api.get('/votos', { userId: '123', agendaId: '456' }, {
   *   onSuccess: (response) => console.log('Voto:', response.data),
   *   onError: (error) => console.error('Erro:', error.message)
   * })
   * ```
   */
  async get<T>(
    url: string,
    paramsOrCallbacks?: QueryParams | RequestCallbacks<T>,
    callbacks?: RequestCallbacks<T>
  ): Promise<void> {
    // Determina se o primeiro parâmetro são parâmetros ou callbacks
    let params: QueryParams | undefined
    let finalCallbacks: RequestCallbacks<T>

    if (paramsOrCallbacks && ('onSuccess' in paramsOrCallbacks || 'onError' in paramsOrCallbacks)) {
      // Primeiro parâmetro são callbacks
      params = undefined
      finalCallbacks = paramsOrCallbacks as RequestCallbacks<T>
    } else {
      // Primeiro parâmetro são parâmetros
      params = paramsOrCallbacks as QueryParams
      finalCallbacks = callbacks || {}
    }

    const { onSuccess, onError } = finalCallbacks

    try {
      // Aplica interceptadores de requisição
      const requestConfig = this.applyRequestInterceptors({
        url,
        method: 'GET',
        headers: {},
        params
      })

      const response = await this.api.get<T>(requestConfig.url || url, {
        headers: requestConfig.headers,
        timeout: requestConfig.timeout,
        params: requestConfig.params || params
      })

      let formattedResponse = this.extractResponseData<T>(response)

      // Aplica interceptadores de resposta
      formattedResponse = this.applyResponseInterceptors(formattedResponse)

      onSuccess?.(formattedResponse)
    } catch (error) {
      let formattedError = this.extractErrorData(error as AxiosError)

      // Aplica interceptadores de erro
      const processedError = await this.applyErrorInterceptors(formattedError)

      // Se o interceptador retornou uma ApiResponse, chama onSuccess
      if ('data' in processedError) {
        onSuccess?.(processedError as ApiResponse<T>)
      } else {
        onError?.(processedError as ApiError)
      }
    }
  }

  /**
   * Realiza uma requisição POST
   * @param url Caminho da requisição (será concatenado com baseURL)
   * @param data Dados a serem enviados no corpo da requisição
   * @param callbacks Objeto com callbacks de sucesso e erro
   * @param callbacks.onSuccess Callback chamado em caso de sucesso
   * @param callbacks.onError Callback chamado em caso de erro
   * 
   * @example
   * ```typescript
   * const dados = { nome: 'João', idade: 30 }
   * api.post('/usuarios', dados, {
   *   onSuccess: (response) => console.log('Criado:', response.data),
   *   onError: (error) => console.error('Erro:', error.message)
   * })
   * ```
   */
  async post<T>(
    url: string,
    data: unknown,
    { onSuccess, onError }: RequestCallbacks<T> = {},
  ): Promise<void> {
    try {
      // Aplica interceptadores de requisição
      const requestConfig = this.applyRequestInterceptors({
        url,
        method: 'POST',
        headers: {},
        data
      })

      const response = await this.api.post<T>(
        requestConfig.url || url,
        requestConfig.data || data,
        {
          headers: requestConfig.headers,
          timeout: requestConfig.timeout
        }
      )

      let formattedResponse = this.extractResponseData<T>(response)

      // Aplica interceptadores de resposta
      formattedResponse = this.applyResponseInterceptors(formattedResponse)

      onSuccess?.(formattedResponse)
    } catch (error) {
      let formattedError = this.extractErrorData(error as AxiosError)

      // Aplica interceptadores de erro
      const processedError = await this.applyErrorInterceptors(formattedError)

      // Se o interceptador retornou uma ApiResponse, chama onSuccess
      if ('data' in processedError) {
        onSuccess?.(processedError as ApiResponse<T>)
      } else {
        onError?.(processedError as ApiError)
      }
    }
  }

  /**
   * Realiza uma requisição PUT
   * @param url Caminho da requisição (será concatenado com baseURL)
   * @param data Dados a serem enviados no corpo da requisição
   * @param callbacks Objeto com callbacks de sucesso e erro
   * @param callbacks.onSuccess Callback chamado em caso de sucesso
   * @param callbacks.onError Callback chamado em caso de erro
   * 
   * @example
   * ```typescript
   * const atualizacao = { idade: 31 }
   * api.put('/usuarios/1', atualizacao, {
   *   onSuccess: (response) => console.log('Atualizado:', response.data),
   *   onError: (error) => console.error('Erro:', error.message)
   * })
   * ```
   */
  async put<T>(
    url: string,
    data: unknown,
    { onSuccess, onError }: RequestCallbacks<T> = {},
  ): Promise<void> {
    try {
      // Aplica interceptadores de requisição
      const requestConfig = this.applyRequestInterceptors({
        url,
        method: 'PUT',
        headers: {},
        data
      })

      const response = await this.api.put<T>(
        requestConfig.url || url,
        requestConfig.data || data,
        {
          headers: requestConfig.headers,
          timeout: requestConfig.timeout
        }
      )

      let formattedResponse = this.extractResponseData<T>(response)

      // Aplica interceptadores de resposta
      formattedResponse = this.applyResponseInterceptors(formattedResponse)

      onSuccess?.(formattedResponse)
    } catch (error) {
      let formattedError = this.extractErrorData(error as AxiosError)

      // Aplica interceptadores de erro
      const processedError = await this.applyErrorInterceptors(formattedError)

      // Se o interceptador retornou uma ApiResponse, chama onSuccess
      if ('data' in processedError) {
        onSuccess?.(processedError as ApiResponse<T>)
      } else {
        onError?.(processedError as ApiError)
      }
    }
  }

  /**
   * Realiza uma requisição DELETE
   * @param url Caminho da requisição (será concatenado com baseURL)
   * @param paramsOrCallbacks Parâmetros de query string ou objeto com callbacks
   * @param callbacks Objeto com callbacks de sucesso e erro (opcional se parâmetros forem fornecidos)
   * 
   * @example
   * ```typescript
   * // DELETE simples
   * api.delete('/usuarios/1', {
   *   onSuccess: (response) => console.log('Deletado com sucesso'),
   *   onError: (error) => console.error('Erro ao deletar:', error.message)
   * })
   * 
   * // DELETE com parâmetros
   * api.delete('/votos', { userId: '123', agendaId: '456' }, {
   *   onSuccess: (response) => console.log('Voto removido:', response.data),
   *   onError: (error) => console.error('Erro:', error.message)
   * })
   * ```
   */
  async delete<T>(
    url: string,
    paramsOrCallbacks?: QueryParams | RequestCallbacks<T>,
    callbacks?: RequestCallbacks<T>
  ): Promise<void> {
    // Determina se o primeiro parâmetro são parâmetros ou callbacks
    let params: QueryParams | undefined
    let finalCallbacks: RequestCallbacks<T>

    if (paramsOrCallbacks && ('onSuccess' in paramsOrCallbacks || 'onError' in paramsOrCallbacks)) {
      // Primeiro parâmetro são callbacks
      params = undefined
      finalCallbacks = paramsOrCallbacks as RequestCallbacks<T>
    } else {
      // Primeiro parâmetro são parâmetros
      params = paramsOrCallbacks as QueryParams
      finalCallbacks = callbacks || {}
    }

    const { onSuccess, onError } = finalCallbacks

    try {
      // Aplica interceptadores de requisição
      const requestConfig = this.applyRequestInterceptors({
        url,
        method: 'DELETE',
        headers: {},
        params
      })

      const response = await this.api.delete<T>(requestConfig.url || url, {
        headers: requestConfig.headers,
        timeout: requestConfig.timeout,
        params: requestConfig.params || params
      })

      let formattedResponse = this.extractResponseData<T>(response)

      // Aplica interceptadores de resposta
      formattedResponse = this.applyResponseInterceptors(formattedResponse)

      onSuccess?.(formattedResponse)
    } catch (error) {
      let formattedError = this.extractErrorData(error as AxiosError)

      // Aplica interceptadores de erro
      const processedError = await this.applyErrorInterceptors(formattedError)

      // Se o interceptador retornou uma ApiResponse, chama onSuccess
      if ('data' in processedError) {
        onSuccess?.(processedError as ApiResponse<T>)
      } else {
        onError?.(processedError as ApiError)
      }
    }
  }
}
