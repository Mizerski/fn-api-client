# FN API Client

Cliente HTTP para requisições API com tratamento de erros e respostas padronizadas.

![Versão](https://img.shields.io/badge/versão-1.0.0-blue.svg)
![Licença](https://img.shields.io/badge/licença-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## Tabela de Conteúdo

- [Instalação](#instalação)
- [Recursos](#recursos)
- [Uso Básico](#uso-básico)
  - [Cliente HTTP](#cliente-http)
  - [Cliente GraphQL](#cliente-graphql)
  - [Cliente Cube GraphQL](#cliente-cube-graphql)
- [Casos de Uso](#casos-de-uso)
- [API Reference](#api-reference)
- [Tipos](#tipos)
- [Contribuindo](#contribuindo)
- [Changelog](#changelog)
- [Licença](#licença)

## Instalação

```bash
# NPM
npm install @wmmz/fn-api-client

# Yarn
yarn add @wmmz/fn-api-client

# PNPM
pnpm add @wmmz/fn-api-client
```

## Recursos

✨ **Principais Características**:
- 🔄 Tratamento padronizado de erros
- 📝 Tipagem forte com TypeScript
- 🎯 Callbacks para sucesso e erro
- 🌐 Suporte a REST e GraphQL
- ⚡ Integração com Cube
- ⏱️ Timeout configurável
- 🔑 Headers customizáveis
- 📦 Zero dependências extras

## Uso Básico

### Cliente HTTP

```typescript
import { ApiClient } from '@wmmz/fn-api-client';

// Configuração do cliente
const client = new ApiClient({
  baseURL: 'https://api.exemplo.com',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer seu-token'
  }
});

// GET com tipagem
interface Usuario {
  id: number;
  nome: string;
  email: string;
}

client.get<Usuario>('/usuarios/1', {
  onSuccess: (response) => {
    console.log('Dados:', response.data);
    console.log('Status:', response.status);
    console.log('Mensagem:', response.message);
  },
  onError: (error) => {
    console.error('Erro:', error.message);
    console.error('Status:', error.status);
    console.error('Detalhes:', error.details);
  }
});

// POST com dados
const novoUsuario = {
  nome: 'João Silva',
  email: 'joao@exemplo.com'
};

client.post<Usuario>('/usuarios', novoUsuario, {
  onSuccess: (response) => console.log('Criado:', response.data),
  onError: (error) => console.error('Erro:', error.message)
});
```

### Cliente GraphQL

```typescript
import { GraphQLClient } from '@wmmz/fn-api-client';

const client = new GraphQLClient({
  baseURL: 'https://api.exemplo.com/graphql',
  headers: {
    'Authorization': 'Bearer seu-token'
  }
});

// Query com variáveis
const query = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

client.query(query, { id: '123' }, {
  onSuccess: (response) => {
    const user = response.data.user;
    console.log('Usuário:', user.name);
    console.log('Posts:', user.posts.length);
  },
  onError: (error) => console.error('Erro:', error.message)
});

// Mutation
const mutation = `
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

const variables = {
  input: {
    name: 'João Silva',
    email: 'joao@exemplo.com'
  }
};

client.mutate(mutation, variables, {
  onSuccess: (response) => console.log('Criado:', response.data.createUser),
  onError: (error) => console.error('Erro:', error.message)
});
```

### Cliente Cube GraphQL

```typescript
import { CubeGraphQLClient } from '@wmmz/fn-api-client';

const client = new CubeGraphQLClient({
  baseURL: 'http://localhost:4000',
  headers: {
    'Authorization': 'Bearer seu-token'
  }
});

// Consulta com filtros e campos
await client.query('/cubejs-api/graphql', {
  limit: 20,
  offset: 0,
  where: {
    vendas: {
      total: { greaterThan: 1000 },
      status: { in: ['APROVADA', 'CONCLUIDA'] }
    },
    cliente: {
      tipo: { equals: 'PJ' }
    }
  },
  fields: {
    vendas: {
      id: true,
      total: true,
      status: true
    },
    cliente: {
      nome: true,
      tipo: true
    }
  }
}, {
  onSuccess: (response) => console.log('Dados:', response.data),
  onError: (error) => console.error('Erro:', error.message)
});
```

## Casos de Uso

### 1. Autenticação e Refresh Token

```typescript
const client = new ApiClient({
  baseURL: 'https://api.exemplo.com',
  headers: {
    'Authorization': `Bearer ${getToken()}`
  }
});

// Interceptor para refresh token
client.api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      error.config.headers['Authorization'] = `Bearer ${newToken}`;
      return client.api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 2. Upload de Arquivos

```typescript
const formData = new FormData();
formData.append('file', file);

client.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  onSuccess: (response) => console.log('Upload concluído:', response.data),
  onError: (error) => console.error('Erro no upload:', error.message)
});
```

### 3. Consultas Cube com Agregações

```typescript
const client = new CubeGraphQLClient({
  baseURL: 'http://localhost:4000'
});

await client.query('/cubejs-api/graphql', {
  where: {
    vendas: {
      data: { between: ['2024-01-01', '2024-12-31'] }
    }
  },
  fields: {
    vendas: {
      total_vendas: true,
      media_ticket: true,
      count_pedidos: true
    }
  }
}, {
  onSuccess: (response) => console.log('Métricas:', response.data),
  onError: (error) => console.error('Erro:', error.message)
});
```

## API Reference

### ApiClient

| Método | Descrição | Parâmetros |
|--------|-----------|------------|
| `constructor` | Cria uma instância do cliente | `config: ApiClientConfig` |
| `get` | Realiza requisição GET | `url: string, callbacks?: RequestCallbacks<T>` |
| `post` | Realiza requisição POST | `url: string, data: unknown, callbacks?: RequestCallbacks<T>` |
| `put` | Realiza requisição PUT | `url: string, data: unknown, callbacks?: RequestCallbacks<T>` |
| `delete` | Realiza requisição DELETE | `url: string, callbacks?: RequestCallbacks<T>` |

### GraphQLClient

| Método | Descrição | Parâmetros |
|--------|-----------|------------|
| `constructor` | Cria uma instância do cliente GraphQL | `config: GraphQLConfig` |
| `query` | Executa uma query GraphQL | `query: string, variables?: GraphQLVariables, callbacks?: RequestCallbacks<T>` |
| `mutate` | Executa uma mutation GraphQL | `mutation: string, variables?: GraphQLVariables, callbacks?: RequestCallbacks<T>` |

### CubeGraphQLClient

| Método | Descrição | Parâmetros |
|--------|-----------|------------|
| `constructor` | Cria uma instância do cliente Cube | `config: CubeGraphQLConfig` |
| `query` | Executa uma query Cube | `url: string, options?: CubeQueryOptions, callbacks?: RequestCallbacks<T>` |

## Tipos

### Configurações

```typescript
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface GraphQLConfig extends ApiClientConfig {}
interface CubeGraphQLConfig extends ApiClientConfig {}
```

### Respostas e Erros

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

interface RequestCallbacks<T> {
  onSuccess?: (response: ApiResponse<T>) => void;
  onError?: (error: ApiError) => void;
}
```

### Cube Query

```typescript
interface CubeQueryOptions {
  limit?: number;
  offset?: number;
  where?: CubeQueryWhere;
  fields?: CubeQueryFields;
  defaultEntity?: string;
  defaultFields?: string[];
}
```

## Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Changelog

### 1.0.0 (2024-03-20)
- ✨ Lançamento inicial
- 🚀 Suporte a REST e GraphQL
- 📦 Integração com Cube
- 🔧 Configurações flexíveis

### 0.9.0 (2024-03-15)
- 🧪 Versão beta
- 🔨 Testes e ajustes finais

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes. 