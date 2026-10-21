# Test Scaffolding

Boilerplate for testing migrated `QueryReader*` components and consumer components that use React Query.

## Full test file template

```typescript
/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { READER_XXX_RECEIVE } from 'calypso/state/reader/action-types';
import QueryReaderXxx from '../index';

function createTestStore() {
  const actions: Array< { type: string; [ key: string ]: unknown } > = [];
  const store = createStore( ( state = {} ) => state );
  const originalDispatch = store.dispatch;
  store.dispatch = ( action: any ) => {
    actions.push( action );
    return originalDispatch( action );
  };
  return { store, actions };
}

function renderWithProviders( ui: React.ReactElement ) {
  const queryClient = new QueryClient( {
    defaultOptions: { queries: { retry: false } },
  } );
  const { store, actions } = createTestStore();

  const result = render(
    <Provider store={ store }>
      <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider>
    </Provider>
  );

  return { ...result, actions, queryClient };
}

describe( 'QueryReaderXxx', () => {
  beforeEach( () => nock.disableNetConnect() );
  afterEach( () => { nock.cleanAll(); nock.enableNetConnect(); } );

  it( 'dispatches receiveXxx when the query resolves', async () => {
    const items = [ /* test data matching API response */ ];

    nock( 'https://public-api.wordpress.com' )
      .get( '/rest/v1.2/read/endpoint' )
      .query( { key: 'value' } )
      .reply( 200, { items } );

    const { actions } = renderWithProviders( <QueryReaderXxx /> );

    await waitFor( () => {
      const action = actions.find( ( a ) => a.type === READER_XXX_RECEIVE );
      expect( action ).toBeDefined();
    } );
  } );

  it( 'renders nothing', () => {
    nock( 'https://public-api.wordpress.com' )
      .get( '/rest/v1.2/read/endpoint' )
      .query( { key: 'value' } )
      .reply( 200, { items: [] } );

    const { container } = renderWithProviders( <QueryReaderXxx /> );
    expect( container.innerHTML ).toBe( '' );
  } );
} );
```

## Key conventions

**nock URL pattern:** `https://public-api.wordpress.com` + `/rest/v{apiVersion}/{path}`. The `query` in nock must match the query params produced by the fetcher (use `addQueryArgs` in the fetcher; mirror the same params here).

**Disable retries** in the test `QueryClient` (`retry: false`) so failing requests don't loop and time out the test.

**Spy on dispatch** via the `createTestStore` helper to assert which actions the bridge component fired without binding tests to a specific reducer.

**Run tests:** `yarn test-client client/components/data/query-reader-{name}/test/`
