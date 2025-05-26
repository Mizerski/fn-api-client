import { ApiClient } from '../services/ApiClient'

/**
 * Exemplo de uso dos interceptadores do ApiClient.
 * Demonstra como adicionar token dinâmico, logging e tratamento de refresh token.
 */

// Simulação de um storage para tokens
const storage = {
    getTokens: () => ({
        accessToken: 'current-access-token',
        refreshToken: 'current-refresh-token'
    }),
    setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
        console.log('Tokens atualizados:', tokens)
    }
}

// Simulação de função para refresh token
const refreshToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
    console.log('Renovando token...')
    // Simula chamada para API de refresh
    return {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
    }
}

// Configuração do cliente API
const api = new ApiClient({
    baseURL: 'https://api.exemplo.com',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Interceptador de requisição para adicionar token dinâmico.
 * Este é o caso de uso principal que você mencionou.
 */
api.addRequestInterceptor((config) => {
    const tokens = storage.getTokens()
    if (tokens?.accessToken) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${tokens.accessToken}`,
        }
    }

    // Adiciona timestamp para debugging
    config.headers = {
        ...config.headers,
        'X-Request-Time': new Date().toISOString(),
    }

    console.log('Requisição interceptada:', {
        method: config.method,
        url: config.url,
        hasAuth: !!tokens?.accessToken
    })

    return config
})

/**
 * Interceptador de resposta para logging.
 */
api.addResponseInterceptor((response) => {
    console.log('Resposta interceptada:', {
        status: response.status,
        message: response.message,
        dataType: typeof response.data
    })

    // Pode modificar a resposta se necessário
    return {
        ...response,
        message: `[${new Date().toISOString()}] ${response.message}`
    }
})

/**
 * Interceptador de erro para refresh token automático.
 */
api.addErrorInterceptor(async (error) => {
    console.log('Erro interceptado:', {
        status: error.status,
        message: error.message,
        code: error.code
    })

    // Se erro 401 (não autorizado), tenta renovar o token
    if (error.status === 401) {
        try {
            console.log('Token expirado, renovando...')
            const newTokens = await refreshToken()
            storage.setTokens(newTokens)

            // Retorna uma resposta de sucesso indicando que o token foi renovado
            return {
                data: { message: 'Token renovado automaticamente' },
                status: 200,
                message: 'Autenticação renovada com sucesso'
            }
        } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError)
            // Se falhar o refresh, retorna o erro original
            return {
                ...error,
                message: 'Sessão expirada. Faça login novamente.'
            }
        }
    }

    // Para outros erros, apenas adiciona timestamp
    return {
        ...error,
        message: `[${new Date().toISOString()}] ${error.message}`
    }
})

/**
 * Exemplos de uso após configurar os interceptadores.
 */

// Exemplo 1: GET simples
console.log('\n=== Exemplo 1: GET ===')
api.get('/usuarios/1', {
    onSuccess: (response) => {
        console.log('✅ Usuário encontrado:', response.data)
        console.log('📋 Mensagem:', response.message)
    },
    onError: (error) => {
        console.error('❌ Erro ao buscar usuário:', error.message)
    }
})

// Exemplo 2: POST com dados
console.log('\n=== Exemplo 2: POST ===')
const novoUsuario = {
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    idade: 30
}

api.post('/usuarios', novoUsuario, {
    onSuccess: (response) => {
        console.log('✅ Usuário criado:', response.data)
        console.log('📊 Status:', response.status)
    },
    onError: (error) => {
        console.error('❌ Erro ao criar usuário:', error.message)
        console.error('🔍 Detalhes:', error.details)
    }
})

// Exemplo 3: Removendo interceptadores
console.log('\n=== Exemplo 3: Gerenciando Interceptadores ===')

// Criando um interceptador específico para remover depois
const logInterceptor = (config: any) => {
    console.log('📝 Log específico:', config.method, config.url)
    return config
}

api.addRequestInterceptor(logInterceptor)

// Fazendo uma requisição com o interceptador
api.get('/test', {
    onSuccess: (response) => console.log('Com interceptador:', response.status)
})

// Removendo o interceptador específico
api.removeRequestInterceptor(logInterceptor)

// Fazendo outra requisição sem o interceptador
api.get('/test', {
    onSuccess: (response) => console.log('Sem interceptador específico:', response.status)
})

// Exemplo 4: Limpando todos os interceptadores
console.log('\n=== Exemplo 4: Limpando Interceptadores ===')
setTimeout(() => {
    console.log('🧹 Limpando todos os interceptadores...')
    api.clearInterceptors()

    api.get('/test-clean', {
        onSuccess: (response) => console.log('Requisição sem interceptadores:', response.status)
    })
}, 2000)

export { api, storage } 