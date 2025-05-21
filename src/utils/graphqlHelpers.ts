import { CubeQueryFields, CubeQueryWhere, CubeQueryOptions } from '../types/graphql'

/**
 * Constrói uma string de campos para a query GraphQL.
 * Transforma um objeto de campos selecionados em uma string formatada
 * para ser usada em uma query GraphQL do Cube.
 * 
 * @param fields Objeto com os campos a serem selecionados
 * @returns String formatada com os campos no formato GraphQL
 * 
 * @example
 * ```typescript
 * const fields = {
 *   vendas: {
 *     total: true,
 *     data: true,
 *     status: true
 *   },
 *   cliente: {
 *     nome: true,
 *     email: true
 *   }
 * }
 * 
 * const result = buildFields(fields)
 * // Resultado:
 * //     vendas {
 * //       total
 * //       data
 * //       status
 * //     }
 * //     cliente {
 * //       nome
 * //       email
 * //     }
 * ```
 */
export function buildFields(fields: CubeQueryFields = {}): string {
  return Object.entries(fields)
    .map(([entity, entityFields]) => {
      const selectedFields = Object.entries(entityFields || {})
        .filter(([, selected]) => selected)
        .map(([field]) => field)
        .join('\n      ')

      return selectedFields
        ? `    ${entity} {\n      ${selectedFields}\n    }`
        : ''
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * Constrói uma string de filtros para a query GraphQL.
 * Transforma um objeto de filtros em uma string formatada
 * para ser usada como cláusula WHERE em uma query GraphQL do Cube.
 * 
 * @param where Objeto com os filtros a serem aplicados
 * @returns String formatada com os filtros no formato GraphQL
 * 
 * @example
 * ```typescript
 * const where = {
 *   vendas: {
 *     total: { greaterThan: 1000, lessThan: 5000 },
 *     status: { in: ['APROVADA', 'CONCLUIDA'] }
 *   },
 *   cliente: {
 *     tipo: { equals: 'PJ' }
 *   }
 * }
 * 
 * const result = buildWhereClause(where)
 * // Resultado:
 * // where: {
 * //   vendas: {
 * //     total: { greaterThan: 1000, lessThan: 5000 },
 * //     status: { in: ["APROVADA", "CONCLUIDA"] }
 * //   },
 * //   cliente: {
 * //     tipo: { equals: "PJ" }
 * //   }
 * // }
 * ```
 */
export function buildWhereClause(where: CubeQueryWhere = {}): string {
  const conditions = Object.entries(where)
    .map(([entity, entityFilters]) => {
      const filters = Object.entries(entityFilters || {})
        .map(([field, conditions]) => {
          const filterStr = Object.entries(conditions || {})
            .map(([operator, value]) => {
              if (Array.isArray(value)) {
                return `${operator}: [${value.join(', ')}]`
              }
              return `${operator}: ${JSON.stringify(value)}`
            })
            .join(', ')
          return `${field}: {${filterStr}}`
        })
        .join(', ')
      return filters ? `${entity}: {${filters}}` : ''
    })
    .filter(Boolean)
    .join(', ')

  return conditions ? `where: {${conditions}}` : ''
}

/**
 * Constrói uma query GraphQL completa para o Cube.
 * Combina todas as opções fornecidas (campos, filtros, paginação)
 * em uma única string de query GraphQL formatada.
 * 
 * @param options Opções da query
 * @param options.limit Limite de registros por página
 * @param options.offset Número de registros para pular (paginação)
 * @param options.where Filtros a serem aplicados
 * @param options.fields Campos a serem retornados
 * @param options.defaultEntity Entidade padrão para consulta
 * @param options.defaultFields Campos padrão a serem retornados
 * @returns String da query GraphQL formatada
 * 
 * @example
 * ```typescript
 * const query = buildCubeQuery({
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
 * })
 * 
 * // Resultado:
 * // query CubeQuery {
 * //   cube(
 * //     limit: 20
 * //     offset: 0
 * //     where: {
 * //       vendas: {
 * //         total: { greaterThan: 1000 },
 * //         status: { in: ["APROVADA", "CONCLUIDA"] }
 * //       }
 * //     }
 * //   ) {
 * //     vendas {
 * //       id
 * //       total
 * //       status
 * //     }
 * //   }
 * // }
 * ```
 */
export function buildCubeQuery(options: CubeQueryOptions = {}): string {
  const { limit, offset, where, fields, defaultEntity, defaultFields } = options
  const whereClause = buildWhereClause(where)
  const selectedFields = buildFields(fields)

  const limitClause = limit ? `limit: ${limit}` : ''
  const offsetClause = offset ? `offset: ${offset}` : ''
  const params = [limitClause, offsetClause, whereClause]
    .filter(Boolean)
    .join('\n        ')

  const defaultFieldsString = defaultFields
    ? `    ${defaultEntity} {\n      ${defaultFields.join('\n      ')}\n    }`
    : ''

  return `
    query CubeQuery {
      cube${params ? `(\n        ${params}\n      )` : ''} {
${selectedFields || defaultFieldsString}
      }
    }
  `.trim()
} 