import { GraphQLClient } from './GraphQLClient'
import { CubeQueryOptions } from '../types/graphql'
import { buildCubeQuery } from '../utils/graphqlHelpers'
import { RequestCallbacks, ApiResponse } from '../types/types'

/**
 * Cliente específico para realizar consultas GraphQL no Cube.
 * Estende o GraphQLClient base adicionando funcionalidades específicas para
 * consultas no Cube, como construção automática de queries e tratamento
 * especializado de respostas.
 * 
 * Características principais:
 * - Construção automática de queries Cube
 * - Suporte a filtros complexos
 * - Paginação integrada
 * - Seleção de campos dinâmica
 * - Tratamento especializado de respostas Cube
 * 
 * @example
 * ```typescript
 * // Configuração do cliente
 * const client = new CubeGraphQLClient({
 *   baseURL: 'http://localhost:4000',
 *   timeout: 30000,
 *   headers: {
 *     'Authorization': 'Bearer seu-token'
 *   }
 * })
 * 
 * // Exemplo de consulta simples
 * await client.query('/cubejs-api/graphql', {
 *   limit: 10,
 *   fields: {
 *     vendas: {
 *       total: true,
 *       data: true,
 *       cliente: true
 *     }
 *   }
 * }, {
 *   onSuccess: (response) => console.log('Vendas:', response.data),
 *   onError: (error) => console.error('Erro:', error.message)
 * })
 * 
 * // Exemplo de consulta com filtros complexos
 * await client.query('/cubejs-api/graphql', {
 *   limit: 20,
 *   offset: 0,
 *   where: {
 *     vendas: {
 *       total: { greaterThan: 1000 },
 *       data: { between: ['2024-01-01', '2024-12-31'] },
 *       status: { in: ['APROVADA', 'CONCLUIDA'] }
 *     },
 *     cliente: {
 *       tipo: { equals: 'PJ' },
 *       regiao: { in: ['SUDESTE', 'SUL'] }
 *     }
 *   },
 *   fields: {
 *     vendas: {
 *       id: true,
 *       total: true,
 *       data: true,
 *       status: true
 *     },
 *     cliente: {
 *       nome: true,
 *       tipo: true,
 *       regiao: true
 *     }
 *   },
 *   defaultEntity: 'vendas',
 *   defaultFields: ['id', 'total', 'data', 'status']
 * }, {
 *   onSuccess: (response) => {
 *     console.log('Total de registros:', response.data.length)
 *     console.log('Dados:', response.data)
 *   },
 *   onError: (error) => {
 *     console.error('Erro na consulta:', error.message)
 *     console.error('Detalhes:', error.details)
 *   }
 * })
 * ```
 */
export class CubeGraphQLClient extends GraphQLClient {
  /**
   * Realiza uma consulta GraphQL específica para o Cube
   * @param url Endpoint da API GraphQL do Cube
   * @param options Opções da query do Cube
   * @param options.limit Limite de registros por página
   * @param options.offset Número de registros para pular (paginação)
   * @param options.where Filtros a serem aplicados na consulta
   * @param options.fields Campos a serem retornados na consulta
   * @param options.defaultEntity Entidade padrão para consulta
   * @param options.defaultFields Campos padrão a serem retornados
   * @param callbacks Callbacks para sucesso e erro
   * 
   * @example
   * ```typescript
   * // Exemplo de consulta com agregações
   * await client.query('/cubejs-api/graphql', {
   *   where: {
   *     vendas: {
   *       data: { equals: '2024-03-01' }
   *     }
   *   },
   *   fields: {
   *     vendas: {
   *       total_vendas: true,
   *       quantidade_pedidos: true,
   *       ticket_medio: true
   *     }
   *   }
   * }, {
   *   onSuccess: (response) => console.log('Métricas:', response.data),
   *   onError: (error) => console.error('Erro:', error.message)
   * })
   * ```
   */
  async query<T>(
    url: string,
    options: CubeQueryOptions = {},
    callbacks: RequestCallbacks<T> = {},
  ): Promise<void> {
    const query = buildCubeQuery(options)
    await this.api.post(url, { query })
    return super.query<T>(query, {}, callbacks)
  }

  /**
   * Extrai dados da resposta do Axios e padroniza o formato específico do Cube
   * @param response Resposta original do Axios
   * @returns Objeto de resposta padronizado com dados do Cube
   * @internal
   */
  protected extractResponseData<T>(response: any): ApiResponse<T> {
    return {
      data: response.data.data.cube,
      status: response.status,
      message: 'Operação realizada com sucesso',
    }
  }
} 