import { ApiResponse, ApiError, RequestCallbacks } from './types'

/**
 * Interface para configuração do cliente GraphQL.
 * Define as opções de configuração específicas para o cliente GraphQL do Cube.
 * 
 * @example
 * ```typescript
 * const config: CubeGraphQLConfig = {
 *   baseURL: 'http://localhost:4000/cubejs-api/graphql',
 *   timeout: 30000,
 *   headers: {
 *     'Authorization': 'Bearer seu-token',
 *     'X-Cube-Version': '2.0'
 *   }
 * }
 * ```
 */
export interface CubeGraphQLConfig {
  /** URL base do endpoint GraphQL */
  baseURL: string
  /** Tempo limite em milissegundos (opcional, padrão: 30000) */
  timeout?: number
  /** Headers customizados para todas as requisições (opcional) */
  headers?: Record<string, string>
}

/**
 * Interface para definir os campos que podem ser selecionados na query.
 * Permite especificar quais campos devem ser retornados para cada entidade.
 * 
 * @example
 * ```typescript
 * const fields: CubeQueryFields = {
 *   vendas: {
 *     total: true,
 *     data: true,
 *     status: true
 *   },
 *   cliente: {
 *     nome: true,
 *     email: true,
 *     tipo: true
 *   }
 * }
 * ```
 */
export interface CubeQueryFields {
  /** 
   * Mapa de entidades e seus campos.
   * A chave é o nome da entidade e o valor é um objeto com os campos a serem selecionados.
   */
  [entity: string]:
    | {
        /** 
         * Mapa de campos da entidade.
         * A chave é o nome do campo e o valor indica se ele deve ser incluído.
         */
        [field: string]: boolean | undefined
      }
    | undefined
}

/**
 * Interface para definir os filtros que podem ser aplicados na query.
 * Suporta diversos operadores de comparação para filtrar os dados.
 * 
 * @example
 * ```typescript
 * const filtroVenda: CubeQueryFilter = {
 *   equals: 1000,
 *   greaterThan: 500,
 *   in: [1, 2, 3],
 *   contains: 'APROVADA'
 * }
 * 
 * const filtroData: CubeQueryFilter = {
 *   between: ['2024-01-01', '2024-12-31'],
 *   notEquals: '2024-03-15'
 * }
 * ```
 */
export interface CubeQueryFilter {
  /** Filtro de igualdade exata */
  equals?: number | string
  /** Filtro de diferença */
  notEquals?: number | string
  /** Filtro de inclusão em lista de valores */
  in?: (number | string)[]
  /** Filtro de exclusão de lista de valores */
  notIn?: (number | string)[]
  /** Filtro de texto contendo valor */
  contains?: string
  /** Filtro de texto não contendo valor */
  notContains?: string
  /** 
   * Permite extensão com operadores adicionais.
   * Exemplos: greaterThan, lessThan, between, etc.
   */
  [key: string]: number | string | (number | string)[] | undefined
}

/**
 * Interface para definir a estrutura dos filtros por entidade.
 * Permite agrupar filtros por entidade e campo.
 * 
 * @example
 * ```typescript
 * const where: CubeQueryWhere = {
 *   vendas: {
 *     total: { greaterThan: 1000 },
 *     data: { between: ['2024-01-01', '2024-12-31'] },
 *     status: { in: ['APROVADA', 'CONCLUIDA'] }
 *   },
 *   cliente: {
 *     tipo: { equals: 'PJ' },
 *     regiao: { in: ['SUDESTE', 'SUL'] }
 *   }
 * }
 * ```
 */
export interface CubeQueryWhere {
  /** 
   * Mapa de entidades e seus filtros.
   * A chave é o nome da entidade e o valor é um objeto com os filtros por campo.
   */
  [entity: string]:
    | {
        /** 
         * Mapa de campos e seus filtros.
         * A chave é o nome do campo e o valor é o objeto de filtro.
         */
        [field: string]: CubeQueryFilter | undefined
      }
    | undefined
}

/**
 * Interface para consulta CubeQuery.
 * Define todas as opções disponíveis para construir uma consulta no Cube.
 * 
 * @example
 * ```typescript
 * const options: CubeQueryOptions = {
 *   limit: 20,
 *   offset: 0,
 *   where: {
 *     vendas: {
 *       total: { greaterThan: 1000 },
 *       status: { in: ['APROVADA', 'CONCLUIDA'] }
 *     }
 *   },
 *   fields: {
 *     vendas: {
 *       id: true,
 *       total: true,
 *       status: true
 *     }
 *   },
 *   defaultEntity: 'vendas',
 *   defaultFields: ['id', 'total', 'status']
 * }
 * ```
 */
export interface CubeQueryOptions {
  /** Limite de registros por página */
  limit?: number
  /** Número de registros para pular (paginação) */
  offset?: number
  /** Filtros a serem aplicados na consulta */
  where?: CubeQueryWhere
  /** Campos a serem retornados na consulta */
  fields?: CubeQueryFields
  /** Entidade padrão para consulta quando não especificada */
  defaultEntity?: string
  /** Campos padrão a serem retornados quando não especificados */
  defaultFields?: string[]
}

export type { ApiResponse, ApiError, RequestCallbacks } 