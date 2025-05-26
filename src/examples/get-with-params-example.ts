import { ApiClient } from '../services/ApiClient'
import { ApiResponse, ApiError } from '../types/types'
import { ENDPOINT_PREFIX, VOTE } from './endpoints'
import { storage } from './storage'

/**
 * Exemplo de uso do GET com parâmetros.
 * Demonstra como fazer requisições GET enviando parâmetros na query string.
 */

// Configuração do cliente API
export const api = new ApiClient({
    baseURL: ENDPOINT_PREFIX,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptador para adicionar token dinâmico
api.addRequestInterceptor((config) => {
    const tokens = storage.getTokens()
    if (tokens?.accessToken) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${tokens.accessToken}`,
        }
    }
    return config
})

/**
 * Interfaces para tipagem das respostas.
 */
interface UserVoteResponse {
    id: string
    userId: string
    agendaId: string
    voteType: 'FOR' | 'AGAINST' | 'ABSTAIN'
    createdAt: string
    updatedAt: string
}

interface User {
    id: string
    name: string
    email: string
    createdAt: string
}

/**
 * Simulação de estado do componente React.
 */
let userVote: string | null = null
let error: string | null = null

const setUserVote = (vote: string | null) => {
    userVote = vote
    console.log('🗳️ User vote updated:', vote)
}

const setError = (errorMessage: string) => {
    error = errorMessage
    console.error('❌ Error set:', errorMessage)
}

/**
 * Exemplo 1: GET com parâmetros - seu caso de uso específico
 */
console.log('\n=== Exemplo 1: GET com Parâmetros (Seu Caso de Uso) ===')

// Agora você pode fazer assim:
api.get<UserVoteResponse>(
    VOTE.GET_BY_USER_ID_AND_AGENDA_ID,
    {
        userId: '123',
        agendaId: '456'
    },
    {
        onSuccess: (response: ApiResponse<UserVoteResponse>) => {
            setUserVote(response.data.voteType)
            console.log('✅ Voto encontrado:', response.data.voteType)
        },
        onError: (error: ApiError) => {
            if (error.status === 404) {
                // Usuário não votou ainda
                setUserVote(null)
                console.log('ℹ️ Usuário ainda não votou')
            } else {
                setError(error.message)
                console.error('❌ Erro ao buscar voto:', error.message)
            }
        },
    }
)

/**
 * Exemplo 2: GET com múltiplos parâmetros
 */
console.log('\n=== Exemplo 2: GET com Múltiplos Parâmetros ===')

api.get<User[]>(
    '/usuarios',
    {
        page: 1,
        limit: 10,
        status: 'active',
        role: 'admin',
        includeDeleted: false
    },
    {
        onSuccess: (response) => {
            console.log('✅ Usuários encontrados:', response.data.length)
            console.log('📋 Lista:', response.data.map(u => u.name))
        },
        onError: (error) => {
            console.error('❌ Erro ao buscar usuários:', error.message)
        }
    }
)

/**
 * Exemplo 3: GET simples sem parâmetros (compatibilidade com versão anterior)
 */
console.log('\n=== Exemplo 3: GET Simples (Compatibilidade) ===')

api.get<User>('/usuarios/me', {
    onSuccess: (response) => {
        console.log('✅ Dados do usuário logado:', response.data.name)
    },
    onError: (error) => {
        console.error('❌ Erro ao buscar dados do usuário:', error.message)
    }
})

/**
 * Exemplo 4: DELETE com parâmetros
 */
console.log('\n=== Exemplo 4: DELETE com Parâmetros ===')

api.delete<{ message: string }>(
    '/votos',
    {
        userId: '123',
        agendaId: '456'
    },
    {
        onSuccess: (response) => {
            console.log('✅ Voto removido:', response.data.message)
            setUserVote(null)
        },
        onError: (error) => {
            console.error('❌ Erro ao remover voto:', error.message)
        }
    }
)

/**
 * Exemplo 5: Interceptador que modifica parâmetros
 */
console.log('\n=== Exemplo 5: Interceptador para Parâmetros ===')

api.addRequestInterceptor((config) => {
    // Adiciona timestamp automático a todos os parâmetros
    if (config.params) {
        config.params = {
            ...config.params,
            _t: Date.now()
        }
    }

    // Log dos parâmetros
    if (config.params) {
        console.log('🔍 Parâmetros da requisição:', config.params)
    }

    return config
})

// Teste com o novo interceptador
api.get<UserVoteResponse>(
    VOTE.GET_BY_USER_ID_AND_AGENDA_ID,
    { userId: '789', agendaId: '101' },
    {
        onSuccess: (response) => {
            console.log('✅ Requisição com timestamp automático bem-sucedida')
        },
        onError: (error) => {
            console.error('❌ Erro:', error.message)
        }
    }
)

/**
 * Comparação: Antes vs Agora
 */
console.log('\n=== Comparação: Antes vs Agora ===')

// ❌ ANTES (não funcionava):
// api.get(VOTE.GET_BY_USER_ID_AND_AGENDA_ID, { ... })

// ✅ AGORA (funciona perfeitamente):
console.log('✅ Agora você pode passar parâmetros diretamente no GET!')
console.log('✅ O token é adicionado automaticamente pelo interceptador!')
console.log('✅ Mantém compatibilidade com o formato anterior!')

export { userVote, error } 