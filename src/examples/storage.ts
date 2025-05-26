/**
 * Sistema de storage para gerenciar tokens e outros dados.
 * Simula um sistema de armazenamento local para tokens de autenticação.
 */

interface Tokens {
    accessToken: string
    refreshToken: string
    expiresAt: number
}

interface UserData {
    id: string
    name: string
    email: string
}

/**
 * Simulação de um storage persistente.
 * Em uma aplicação real, isso poderia usar localStorage, AsyncStorage, etc.
 */
class StorageService {
    private tokens: Tokens | null = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh_token_exemplo',
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    }

    private userData: UserData | null = {
        id: '123',
        name: 'João Silva',
        email: 'joao@exemplo.com'
    }

    /**
     * Obtém os tokens de autenticação armazenados.
     * @returns Tokens ou null se não existirem
     */
    getTokens(): Tokens | null {
        // Verifica se o token não expirou
        if (this.tokens && this.tokens.expiresAt < Date.now()) {
            console.warn('Token expirado')
            this.tokens = null
        }
        return this.tokens
    }

    /**
     * Armazena novos tokens de autenticação.
     * @param tokens Novos tokens para armazenar
     */
    setTokens(tokens: Tokens): void {
        this.tokens = tokens
        console.log('✅ Tokens atualizados no storage')
    }

    /**
     * Remove os tokens armazenados.
     */
    clearTokens(): void {
        this.tokens = null
        console.log('🗑️ Tokens removidos do storage')
    }

    /**
     * Obtém os dados do usuário armazenados.
     * @returns Dados do usuário ou null
     */
    getUserData(): UserData | null {
        return this.userData
    }

    /**
     * Armazena dados do usuário.
     * @param userData Dados do usuário para armazenar
     */
    setUserData(userData: UserData): void {
        this.userData = userData
        console.log('✅ Dados do usuário atualizados no storage')
    }

    /**
     * Remove dados do usuário.
     */
    clearUserData(): void {
        this.userData = null
        console.log('🗑️ Dados do usuário removidos do storage')
    }

    /**
     * Limpa todos os dados armazenados.
     */
    clearAll(): void {
        this.clearTokens()
        this.clearUserData()
        console.log('🧹 Storage completamente limpo')
    }
}

// Instância singleton do storage
export const storage = new StorageService()

// Tipos exportados para uso externo
export type { Tokens, UserData } 