import { CubeGraphQLClient } from '../services/CubeGraphQLClient'

/**
 * Exemplo de uso do cliente GraphQL para consultar dados de motoristas
 */
async function exemploConsultaMotoristas() {
  // Instancia o cliente GraphQL com a configuração
  const client = new CubeGraphQLClient({
    baseURL: 'http://localhost:4000',
    timeout: 30000,
    headers: {
      // Adicione headers customizados aqui se necessário
      'Authorization': 'Bearer seu-token-aqui'
    }
  })

  // Define as opções da consulta
  const options = {
    limit: 10,
    offset: 0,
    where: {
      motorista: {
        id_motorista: { equals: 1 }
      }
    },
    fields: {
      motorista: {
        nome_do_motorista: true,
        id_motorista: true,
        login_motorista: true
      }
    },
    defaultEntity: 'motorista',
    defaultFields: ['nome_do_motorista', 'id_motorista', 'login_motorista']
  }

  // Realiza a consulta
  await client.query('/cubejs-api/graphql', options, {
    onSuccess: (response) => {
      console.log('Dados dos motoristas:', response.data)
    },
    onError: (error) => {
      console.error('Erro ao consultar motoristas:', error.message)
    }
  })
}

// Executa o exemplo
exemploConsultaMotoristas() 