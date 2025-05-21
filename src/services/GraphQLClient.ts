import axios, { AxiosError, AxiosInstance } from 'axios'
import { ApiError, ApiResponse, RequestCallbacks } from '../types/types'

/**
 * Interface para configuração do cliente GraphQL
 */
export interface GraphQLConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

/**
 * Interface para variáveis da query GraphQL
 */
export interface GraphQLVariables {
  [key: string]: unknown
}

/**
 * Cliente base para realizar consultas GraphQL.
 * Fornece uma interface simplificada para executar queries e mutations GraphQL
 * com tratamento automático de erros e padronização de respostas.
 * 
 * Características principais:
 * - Suporte a queries e mutations
 * - Tratamento automático de erros
 * - Respostas padronizadas
 * - Tipagem forte com TypeScript
 * - Suporte a variáveis dinâmicas
 * 
 * @example
 * ```typescript
 * // Configuração do cliente
 * const client = new GraphQLClient({
 *   baseURL: 'https://api.exemplo.com/graphql',
 *   headers: {
 *     'Authorization': 'Bearer seu-token'
 *   }
 * })
 * 
 * // Exemplo de query com variáveis
 * const query = `
 *   query GetUser($id: ID!) {
 *     user(id: $id) {
 *       id
 *       name
 *       email
 *       posts {
 *         id
 *         title
 *       }
 *     }
 *   }
 * `
 * 
 * await client.query(query, { id: '123' }, {
 *   onSuccess: (response) => {
 *     const user = response.data.user
 *     console.log('Usuário:', user.name)
 *     console.log('Posts:', user.posts.length)
 *   },
 *   onError: (error) => console.error('Erro:', error.message)
 * })
 * 
 * // Exemplo de mutation
 * const mutation = `
 *   mutation CreateUser($input: UserInput!) {
 *     createUser(input: $input) {
 *       id
 *       name
 *       email
 *     }
 *   }
 * `
 * 
 * const variables = {
 *   input: {
 *     name: 'João Silva',
 *     email: 'joao@exemplo.com',
 *     password: 'senha123'
 *   }
 * }
 * 
 * await client.mutate(mutation, variables, {
 *   onSuccess: (response) => console.log('Usuário criado:', response.data.createUser),
 *   onError: (error) => console.error('Erro ao criar usuário:', error.message)
 * })
 * ```
 */
export class GraphQLClient {
  protected api: AxiosInstance

  /**
   * Cria uma nova instância do cliente GraphQL
   * @param config Configurações do cliente
   * @param config.baseURL URL do endpoint GraphQL
   * @param config.timeout Tempo limite em milissegundos (padrão: 30000)
   * @param config.headers Headers customizados para todas as requisições
   */
  constructor(config: GraphQLConfig) {
    this.api = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    })
  }

  /**
   * Extrai e padroniza os dados de erro do Axios
   * @param error Erro original do Axios
   * @returns Objeto de erro padronizado com mensagem, status e detalhes
   * @internal
   */
  protected extractErrorData(error: AxiosError): ApiError {
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
   * @returns Objeto de resposta padronizado com dados, status e mensagem
   * @internal
   */
  protected extractResponseData<T>(response: any): ApiResponse<T> {
    return {
      data: response.data.data,
      status: response.status,
      message: 'Operação realizada com sucesso',
    }
  }

  /**
   * Executa uma query GraphQL
   * @param query String da query GraphQL
   * @param variables Variáveis a serem passadas para a query
   * @param callbacks Objeto com callbacks de sucesso e erro
   * @param callbacks.onSuccess Callback chamado quando a query é bem sucedida
   * @param callbacks.onError Callback chamado quando ocorre um erro
   * 
   * @example
   * ```typescript
   * const query = `
   *   query GetProducts($category: String!, $limit: Int) {
   *     products(category: $category, limit: $limit) {
   *       id
   *       name
   *       price
   *     }
   *   }
   * `
   * 
   * const variables = {
   *   category: 'electronics',
   *   limit: 10
   * }
   * 
   * await client.query(query, variables, {
   *   onSuccess: (response) => console.log('Produtos:', response.data.products),
   *   onError: (error) => console.error('Erro:', error.message)
   * })
   * ```
   */
  async query<T>(
    query: string,
    variables: GraphQLVariables = {},
    { onSuccess, onError }: RequestCallbacks<T> = {},
  ): Promise<void> {
    try {
      const response = await this.api.post('', {
        query,
        variables,
      })
      const formattedResponse = this.extractResponseData<T>(response)
      onSuccess?.(formattedResponse)
    } catch (error) {
      const formattedError = this.extractErrorData(error as AxiosError)
      onError?.(formattedError)
    }
  }

  /**
   * Executa uma mutation GraphQL
   * @param mutation String da mutation GraphQL
   * @param variables Variáveis a serem passadas para a mutation
   * @param callbacks Objeto com callbacks de sucesso e erro
   * @param callbacks.onSuccess Callback chamado quando a mutation é bem sucedida
   * @param callbacks.onError Callback chamado quando ocorre um erro
   * 
   * @example
   * ```typescript
   * const mutation = `
   *   mutation UpdateProduct($id: ID!, $input: ProductInput!) {
   *     updateProduct(id: $id, input: $input) {
   *       id
   *       name
   *       price
   *     }
   *   }
   * `
   * 
   * const variables = {
   *   id: '123',
   *   input: {
   *     name: 'Novo Nome',
   *     price: 99.99
   *   }
   * }
   * 
   * await client.mutate(mutation, variables, {
   *   onSuccess: (response) => console.log('Produto atualizado:', response.data.updateProduct),
   *   onError: (error) => console.error('Erro ao atualizar:', error.message)
   * })
   * ```
   */
  async mutate<T>(
    mutation: string,
    variables: GraphQLVariables = {},
    { onSuccess, onError }: RequestCallbacks<T> = {},
  ): Promise<void> {
    return this.query<T>(mutation, variables, { onSuccess, onError })
  }
} 