# FN API Client

Cliente HTTP para requisições API com tratamento de erros e respostas padronizadas.

![Licença](https://img.shields.io/badge/licença-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
[![npm version](https://img.shields.io/npm/v/@wmmz/fn-api-client.svg)](https://www.npmjs.com/package/@wmmz/fn-api-client)

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

// Interceptador para adicionar token dinâmico
client.addRequestInterceptor((config) => {
  const tokens = storage.getTokens();
  if (tokens?.accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${tokens.accessToken}`
    };
  }
  return config;
});

// Interceptador para refresh token automático
client.addErrorInterceptor(async (error) => {
  if (error.status === 401) {
    await refreshToken();
    return {
      data: { message: 'Token renovado' },
      status: 200,
      message: 'Autenticação renovada'
    };
  }
  return error;
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

// GET com parâmetros
client.get<UserVote>('/votos', { userId: '123', agendaId: '456' }, {
  onSuccess: (response) => console.log('Voto:', response.data),
  onError: (error) => {
    if (error.status === 404) {
      console.log('Usuário não votou ainda');
    }
  }
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

### 1. Interceptadores para Autenticação

```typescript
const client = new ApiClient({
  baseURL: 'https://api.exemplo.com'
});

// Interceptador de requisição para token dinâmico
client.addRequestInterceptor((config) => {
  const tokens = storage.getTokens();
  if (tokens?.accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${tokens.accessToken}`
    };
  }
  return config;
});

// Interceptador de erro para refresh token automático
client.addErrorInterceptor(async (error) => {
  if (error.status === 401) {
    try {
      const newTokens = await refreshToken();
      storage.setTokens(newTokens);
      return {
        data: { message: 'Token renovado automaticamente' },
        status: 200,
        message: 'Autenticação renovada com sucesso'
      };
    } catch (refreshError) {
      return {
        ...error,
        message: 'Sessão expirada. Faça login novamente.'
      };
    }
  }
  return error;
});

// Interceptador de resposta para logging
client.addResponseInterceptor((response) => {
  console.log(`✅ ${response.status}: ${response.message}`);
  return response;
});
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
| `get` | Realiza requisição GET | `url: string, paramsOrCallbacks?: QueryParams \| RequestCallbacks<T>, callbacks?: RequestCallbacks<T>` |
| `post` | Realiza requisição POST | `url: string, data: unknown, callbacks?: RequestCallbacks<T>` |
| `put` | Realiza requisição PUT | `url: string, data: unknown, callbacks?: RequestCallbacks<T>` |
| `delete` | Realiza requisição DELETE | `url: string, paramsOrCallbacks?: QueryParams \| RequestCallbacks<T>, callbacks?: RequestCallbacks<T>` |
| `addRequestInterceptor` | Adiciona interceptador de requisição | `interceptor: RequestInterceptor` |
| `addResponseInterceptor` | Adiciona interceptador de resposta | `interceptor: ResponseInterceptor` |
| `addErrorInterceptor` | Adiciona interceptador de erro | `interceptor: ErrorInterceptor` |
| `removeRequestInterceptor` | Remove interceptador de requisição | `interceptor: RequestInterceptor` |
| `removeResponseInterceptor` | Remove interceptador de resposta | `interceptor: ResponseInterceptor` |
| `removeErrorInterceptor` | Remove interceptador de erro | `interceptor: ErrorInterceptor` |
| `clearInterceptors` | Remove todos os interceptadores | `void` |

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

### Interceptadores

```typescript
interface RequestConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, unknown>;
  timeout?: number;
}

interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig;
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T>;
type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiResponse<unknown>>;
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

## Changelog (em desenvolvimento | versão 1.0.1)

