import { ApiClient } from '../services/ApiClient'
import { ENDPOINT_PREFIX } from './endpoints'
import { storage } from './storage'

/**
 * Exemplo específico do seu caso de uso:
 * Interceptador para adicionar token dinâmico a cada requisição.
 */

export const api = new ApiClient({
    baseURL: ENDPOINT_PREFIX,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptador para adicionar token dinâmicamente a cada requisição
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

console.log(
    'storage.getTokens()?.accessToken',
    storage.getTokens()?.accessToken,
)

/**
 * Exemplo de uso após configurar o interceptador.
 * O token será adicionado automaticamente a todas as requisições.
 */

// Interface de exemplo para tipagem
interface Usuario {
    id: string
    nome: string
    email: string
    createdAt: string
}

// Exemplo 1: GET de usuário
// O token será adicionado automaticamente pelo interceptador
api.get<Usuario>('/usuarios/me', {
    onSuccess: (response) => {
        console.log('✅ Dados do usuário:', response.data)
        console.log('🔑 Token foi adicionado automaticamente')
    },
    onError: (error) => {
        console.error('❌ Erro ao buscar usuário:', error.message)
        if (error.status === 401) {
            console.error('🚫 Token inválido ou expirado')
        }
    }
})

// Exemplo 2: POST para criar um recurso
// O token também será adicionado automaticamente
const novoProduto = {
    nome: 'Produto Teste',
    preco: 99.99,
    categoria: 'Eletrônicos'
}

api.post('/produtos', novoProduto, {
    onSuccess: (response) => {
        console.log('✅ Produto criado:', response.data)
        console.log('🔑 Authorization header foi adicionado automaticamente')
    },
    onError: (error) => {
        console.error('❌ Erro ao criar produto:', error.message)
    }
})

// Exemplo 3: Interceptador adicional para debug
api.addRequestInterceptor((config) => {
    console.log('🔍 Debug da requisição:', {
        method: config.method,
        url: config.url,
        hasAuthHeader: !!config.headers?.Authorization,
        headers: config.headers
    })
    return config
})

// Exemplo 4: Interceptador de resposta para debug
api.addResponseInterceptor((response) => {
    console.log('📥 Resposta recebida:', {
        status: response.status,
        message: response.message,
        timestamp: new Date().toISOString()
    })
    return response
})

export { storage } 