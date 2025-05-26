/**
 * Configuração de endpoints da API.
 * Define as URLs base e específicas para cada recurso.
 */

export const ENDPOINT_PREFIX = 'https://api.exemplo.com'

/**
 * Endpoints relacionados a votos.
 */
export const VOTE = {
    GET_BY_USER_ID_AND_AGENDA_ID: '/votos/usuario-agenda',
    CREATE: '/votos',
    UPDATE: '/votos',
    DELETE: '/votos'
} as const

/**
 * Endpoints relacionados a usuários.
 */
export const USER = {
    GET_BY_ID: '/usuarios',
    GET_ME: '/usuarios/me',
    CREATE: '/usuarios',
    UPDATE: '/usuarios',
    DELETE: '/usuarios'
} as const

/**
 * Endpoints relacionados a agendas.
 */
export const AGENDA = {
    GET_ALL: '/agendas',
    GET_BY_ID: '/agendas',
    CREATE: '/agendas',
    UPDATE: '/agendas',
    DELETE: '/agendas'
} as const 