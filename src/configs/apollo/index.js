import { ApolloClient } from 'apollo-client'
import { ApolloLink, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { getMainDefinition } from 'apollo-utilities'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
})

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: localStorage.getItem('token') || '',
  }
}))

//bdh-backend-stargram.herokuapp.com/graphql
//localhost:5000/graphql

const wsLink = new WebSocketLink({
  uri: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//bdh-backend-stargram.herokuapp.com/graphql`,
  options: {
    reconnect: true,
    connectionParams:{
    	authorization: localStorage.getItem('token') || '',
    }
  }
})


const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  httpLink,
  wsLink
)

const client = new ApolloClient({
  link: ApolloLink.from([link, authLink]),
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
  ssrForceFetchDelay:100
})

export { client }
