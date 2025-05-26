/**
 * Interface para erro padronizado da API.
 * Representa um erro que ocorreu durante uma requisição,
 * contendo informações detalhadas sobre o problema.
 * 
 * @example
 * ```typescript
 * const error: ApiError = {
 *   message: 'Usuário não encontrado',
 *   status: 404,
 *   code: 'USER_NOT_FOUND',
 *   details: {
 *     userId: '123',
 *     timestamp: '2024-03-20T10:00:00Z'
 *   }
 * }
 * ```
 */
export interface ApiError {
  /** Mensagem descritiva do erro */
  message: string
  /** Código de status HTTP do erro */
  status: number
  /** Código interno do erro (opcional) */
  code?: string
  /** Detalhes adicionais do erro (opcional) */
  details?: unknown
}

/**
 * Interface base para respostas da API.
 * Padroniza o formato de resposta para todas as requisições bem-sucedidas.
 * 
 * @example
 * ```typescript
 * interface User {
 *   id: number
 *   name: string
 *   email: string
 * }
 * 
 * const response: ApiResponse<User> = {
 *   data: {
 *     id: 1,
 *     name: 'João Silva',
 *     email: 'joao@exemplo.com'
 *   },
 *   status: 200,
 *   message: 'Usuário encontrado com sucesso'
 * }
 * ```
 */
export interface ApiResponse<T> {
  /** Dados retornados pela API */
  data: T
  /** Código de status HTTP da resposta */
  status: number
  /** Mensagem descritiva do resultado */
  message: string
}

/**
 * Interface para callbacks de sucesso e erro.
 * Define as funções que serão chamadas após uma requisição,
 * permitindo tratamento personalizado dos resultados.
 * 
 * @example
 * ```typescript
 * const callbacks: RequestCallbacks<User> = {
 *   onSuccess: (response) => {
 *     console.log('Usuário:', response.data)
 *     console.log('Status:', response.status)
 *     console.log('Mensagem:', response.message)
 *   },
 *   onError: (error) => {
 *     console.error('Erro:', error.message)
 *     console.error('Status:', error.status)
 *     if (error.code) {
 *       console.error('Código:', error.code)
 *     }
 *     if (error.details) {
 *       console.error('Detalhes:', error.details)
 *     }
 *   }
 * }
 * ```
 */
export interface RequestCallbacks<T> {
  /** Função chamada quando a requisição é bem-sucedida */
  onSuccess?: (response: ApiResponse<T>) => void
  /** Função chamada quando ocorre um erro na requisição */
  onError?: (error: ApiError) => void
}

/**
 * Configurações do cliente API.
 * Define as opções de configuração para instanciar um cliente API.
 * 
 * @example
 * ```typescript
 * const config: ApiClientConfig = {
 *   baseURL: 'https://api.exemplo.com',
 *   timeout: 5000,
 *   headers: {
 *     'Authorization': 'Bearer seu-token',
 *     'X-API-Version': '1.0',
 *     'Accept-Language': 'pt-BR'
 *   }
 * }
 * ```
 */
export interface ApiClientConfig {
  /** URL base para todas as requisições */
  baseURL: string
  /** Tempo limite em milissegundos (opcional, padrão: 10000) */
  timeout?: number
  /** Headers customizados para todas as requisições (opcional) */
  headers?: Record<string, string>
}

/**
 * Configuração de uma requisição HTTP.
 * Representa os dados que podem ser interceptados e modificados antes do envio.
 * 
 * @example
 * ```typescript
 * const interceptor: RequestInterceptor = (config) => {
 *   const token = getToken()
 *   if (token) {
 *     config.headers = {
 *       ...config.headers,
 *       Authorization: `Bearer ${token}`
 *     }
 *   }
 *   return config
 * }
 * ```
 */
export interface RequestConfig {
  /** URL da requisição */
  url?: string
  /** Método HTTP */
  method?: string
  /** Headers da requisição */
  headers?: Record<string, string>
  /** Dados do corpo da requisição */
  data?: unknown
  /** Parâmetros de query string */
  params?: Record<string, unknown>
  /** Timeout específico para esta requisição */
  timeout?: number
}

/**
 * Função interceptadora de requisições.
 * Permite modificar a configuração da requisição antes do envio.
 * 
 * @param config Configuração da requisição
 * @returns Configuração modificada da requisição
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig

/**
 * Função interceptadora de respostas.
 * Permite processar a resposta antes de retorná-la para o callback.
 * 
 * @param response Resposta da requisição
 * @returns Resposta processada
 */
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T>

/**
 * Função interceptadora de erros.
 * Permite processar erros antes de retorná-los para o callback.
 * 
 * @param error Erro da requisição
 * @returns Erro processado ou uma nova resposta
 */
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiResponse<unknown>>

/**
 * Parâmetros de query string para requisições GET e DELETE.
 * Permite enviar parâmetros na URL da requisição.
 * 
 * @example
 * ```typescript
 * const params: QueryParams = {
 *   userId: '123',
 *   agendaId: '456',
 *   includeDetails: true,
 *   limit: 10
 * }
 * 
 * // Será convertido para: ?userId=123&agendaId=456&includeDetails=true&limit=10
 * ```
 */
export interface QueryParams {
  [key: string]: string | number | boolean | undefined
}
