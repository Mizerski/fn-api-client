import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import {
  ApiClientConfig,
  ApiError,
  ApiResponse,
  RequestCallbacks,
} from '../types/types'

/**
 * Cliente HTTP para requisições API com tratamento de erros e respostas padronizadas.
 * Fornece uma interface simplificada para realizar requisições HTTP com tratamento automático
 * de erros e padronização de respostas.
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
   * @param callbacks Objeto com callbacks de sucesso e erro
   * @param callbacks.onSuccess Callback chamado em caso de sucesso
   * @param callbacks.onError Callback chamado em caso de erro
   * 
   * @example
   * ```typescript
   * api.get('/usuarios/1', {
   *   onSuccess: (response) => console.log('Usuário:', response.data),
   *   onError: (error) => console.error('Erro:', error.message)
   * })
   * ```
   */
  async get<T>(
    url: string,
    { onSuccess, onError }: RequestCallbacks<T> = {},
  ): Promise<void> {
    try {
      const response = await this.api.get<T>(url)
      const formattedResponse = this.extractResponseData<T>(response)
      onSuccess?.(formattedResponse)
    } catch (error) {
      const formattedError = this.extractErrorData(error as AxiosError)
      onError?.(formattedError)
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
      const response = await this.api.post<T>(url, data)
      const formattedResponse = this.extractResponseData<T>(response)
      onSuccess?.(formattedResponse)
    } catch (error) {
      const formattedError = this.extractErrorData(error as AxiosError)
      onError?.(formattedError)
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
      const response = await this.api.put<T>(url, data)
      const formattedResponse = this.extractResponseData<T>(response)
      onSuccess?.(formattedResponse)
    } catch (error) {
      const formattedError = this.extractErrorData(error as AxiosError)
      onError?.(formattedError)
    }
  }

  /**
   * Realiza uma requisição DELETE
   * @param url Caminho da requisição (será concatenado com baseURL)
   * @param callbacks Objeto com callbacks de sucesso e erro
   * @param callbacks.onSuccess Callback chamado em caso de sucesso
   * @param callbacks.onError Callback chamado em caso de erro
   * 
   * @example
   * ```typescript
   * api.delete('/usuarios/1', {
   *   onSuccess: (response) => console.log('Deletado com sucesso'),
   *   onError: (error) => console.error('Erro ao deletar:', error.message)
   * })
   * ```
   */
  async delete<T>(
    url: string,
    { onSuccess, onError }: RequestCallbacks<T> = {},
  ): Promise<void> {
    try {
      const response = await this.api.delete<T>(url)
      const formattedResponse = this.extractResponseData<T>(response)
      onSuccess?.(formattedResponse)
    } catch (error) {
      const formattedError = this.extractErrorData(error as AxiosError)
      onError?.(formattedError)
    }
  }
}
