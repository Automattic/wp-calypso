---
name: calypso-react-query-migration
description: Use when migrating a Calypso Reader data component (QueryReader*) from Redux data-layer to React Query, migrating from @automattic/data-stores to api-core/api-queries, or when creating new Reader data-fetching code in wp-calypso
---

# Calypso React Query Migration

Two migration sources exist in the Reader codebase:

1. **Redux data-layer** (`dispatchRequest` + `http` actions) -> React Query via `@automattic/api-core` and `@automattic/api-queries`
2. **`@automattic/data-stores`** (hooks with inline `wpcomRequest`) -> same target packages

Both converge on the same target architecture: fetchers in `api-core`, query options in `api-queries`, components use `useQuery()` directly.

## When to Use

- Migrating an existing `client/components/data/query-reader-*` component (source: Redux data-layer)
- Migrating a `@automattic/data-stores` Reader hook (e.g., `Reader.useReadFeedSiteQuery`) to `api-core/api-queries`
- Creating a new Reader data-fetching hook
- Removing old Redux data-layer handlers after migration

## Audit CRUD Coverage First

Before migrating, **list every action that exists for the resource** — not just the read query. A resource (e.g., Lists) typically has multiple operations:

| Operation | Redux pattern | React Query pattern |
|-----------|---------------|---------------------|
| Read (list) | `READER_XXX_REQUEST` -> `dispatchRequest` GET | `useQuery(readXxxQuery())` |
| Read (single) | `READER_XXX_REQUEST` -> `dispatchRequest` GET | `useQuery(readXxxQuery(id))` |
| Create | `READER_XXX_CREATE` -> `dispatchRequest` POST | `useMutation(createXxxMutation())` |
| Update | `READER_XXX_UPDATE` -> `dispatchRequest` POST | `useMutation(updateXxxMutation())` |
| Delete | `READER_XXX_DELETE` -> `dispatchRequest` POST | `useMutation(deleteXxxMutation())` |
| Follow/Unfollow | `READER_XXX_FOLLOW` etc. | dedicated mutation each |

### How to audit

Grep the data-layer handler file for all actions tied to this resource:

```bash
grep -E "READER_(XXX|YYY)" client/state/data-layer/wpcom/read/{name}/index.js
grep -E "READER_(XXX|YYY)" client/state/reader/{name}/actions.ts
```

Every action you find needs a migration plan. **Do not migrate read-only and leave mutations in Redux** — that creates two sources of truth where the React Query cache and Redux state can diverge (deleted item still shows in sidebar until manual refresh).

### Per-action checklist

For each action, decide:
- [ ] What is the source pattern? (Redux data-layer / data-stores hook)
- [ ] What is the target? (query / mutation)
- [ ] Which queries need invalidation after a mutation succeeds? (e.g., delete invalidates the list query)
- [ ] Where are the side effects (notices, navigation, Redux receive actions) — and do they move to the component or stay in Redux?

Recommended commit split when migrating multiple actions:
1. One commit per action group (read, follow/unfollow, create/update, delete)
2. Each commit removes its Redux counterpart in the same commit (mutations don't need a bridge — see below)

## Migration Steps

Two commits per migration: **migrate** then **clean up**.

### Commit 1: Migrate to React Query

#### 1. Create the API fetcher (`packages/api-core/src/read-{name}/`)

**Before creating anything, check that the endpoint isn't already in `api-core`.** The package has 100+ modules — duplicating a fetcher leads to drift between two implementations of the same call.

Search by:
- **Path**: grep for the API path (e.g., `/read/sites/`, `/read/feed/`) under `packages/api-core/src/`
- **Function name**: grep for `fetchRead{Name}` or related verb forms (`fetch{Resource}`, `get{Resource}`)
- **Module name**: check `ls packages/api-core/src/` for any existing `read-{name}/` or similar folder

```bash
grep -rn "/read/{endpoint}" packages/api-core/src/
ls packages/api-core/src/ | grep -i {name}
```

If a fetcher exists:
- **Reuse it** — import from `@automattic/api-core` and only create the missing query/mutation in `api-queries`
- **Extend it** — if your call needs different params, add a new exported fetcher to the existing folder (don't create a parallel folder)

Only create a new `read-{name}/` directory if no equivalent exists.

Three files (when creating new):

**`fetchers.ts`** — calls `wpcom.req.get()` (or `.post()`):
```typescript
import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { MyResponseType } from './types';

export const fetchReadXxx = ( params?: SomeParams ): Promise< MyResponseType > => {
  return wpcom.req.get( {
    path: addQueryArgs( '/read/endpoint', { key: 'value' } ),
    apiVersion: '1.2',
  } );
};
```

**`types.ts`** — response and item interfaces:
```typescript
export interface XxxItem {
  ID: number;
  title: string;
  // ...fields from API response
}

export interface ReadXxxResponse {
  items: XxxItem[];
}
```

**`index.ts`** — barrel exports:
```typescript
export * from './fetchers';
export * from './types';
```

Then add `export * from './read-{name}';` to `packages/api-core/src/index.ts`.

**Where to find the API details:** Look at the Redux data-layer handler for the action being migrated. The `http()` call contains the `method`, `path`, `apiVersion`, and `query`/`body` params. Copy these exactly.

#### 2. Create the query options (`packages/api-queries/src/read-{name}.ts`)

```typescript
import { fetchReadXxx } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readXxxQuery = ( param?: string | null ) =>
  queryOptions( {
    queryKey: [ 'read', 'xxx', param ],
    staleTime: 1000 * 60 * 5,
    queryFn: () => fetchReadXxx( param! ),
    enabled: param != null, // only if conditional
  } );
```

Then add `export * from './read-{name}';` to `packages/api-queries/src/index.ts`.

**Key decisions:**
- `queryKey`: use `['read', '{domain}', ...params]` pattern
- `staleTime`: how often does this data change? 1min for feeds, 5min for lists
- `enabled`: use when the query depends on a parameter that may be null/undefined

#### 3. Rewrite the query component (`client/components/data/query-reader-{name}/`)

Delete the `.jsx`, create `.tsx`. The component bridges React Query data into Redux:

```typescript
import { readXxxQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { receiveXxx } from 'calypso/state/reader/xxx/actions';

export default function QueryReaderXxx() {
  const dispatch = useDispatch();
  const { data } = useQuery( readXxxQuery() );

  useEffect( () => {
    if ( data?.items ) {
      dispatch( receiveXxx( data.items ) );
    }
  }, [ data, dispatch ] );

  return null;
}
```

**Critical: keep dispatching the RECEIVE action.** Other parts of Calypso still read from Redux state. The bridge component ensures backward compatibility.

**If the component has error handling:** dispatch the existing error action too:
```typescript
const { data, isSuccess, isError, error } = useQuery( readXxxQuery( param ) );

useEffect( () => {
  if ( isSuccess ) {
    dispatch( receiveXxxSuccess( data ) );
  }
}, [ dispatch, data, isSuccess ] );

useEffect( () => {
  if ( isError && param ) {
    dispatch( receiveXxxFailure( param, error ) );
  }
}, [ dispatch, param, isError, error ] );
```

#### 4. Write tests (`client/components/data/query-reader-{name}/test/index.test.tsx`)

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

**nock URL pattern:** Always `https://public-api.wordpress.com` + `/rest/v{apiVersion}/{path}`. The `query` in nock must match the query params in the fetcher.

Run tests: `yarn test-client client/components/data/query-reader-{name}/test/`

### Commit 2: Clean Up Redux (separate commit)

Only after the migration commit is passing:

1. **Remove the REQUEST action type** from `client/state/reader/action-types.ts`
2. **Remove the request action creator** from `client/state/reader/{domain}/actions.ts` (e.g., `requestSubscribedLists`)
3. **Remove the data-layer handler** from `client/state/data-layer/wpcom/read/{domain}/index.js` — only the specific handler block for the REQUEST action
4. **Remove the isRequesting reducer** from `client/state/reader/{domain}/reducer.js` and from the `combineReducers()` call
5. **Update selectors** that referenced the removed state (e.g., `isRequestingXxx`)
6. **Remove related tests** for deleted actions, reducers, and selectors

**Be careful:** Only remove the specific handler/action being migrated. The data-layer file may contain handlers for other actions (FOLLOW, UNFOLLOW, UPDATE, etc.) that are NOT being migrated.

## Migration from `@automattic/data-stores`

Some Reader queries live in `packages/data-stores/src/reader/queries/` as custom hooks using `wpcomRequest`. These need to move to `api-core` + `api-queries`.

### Differences from Redux data-layer migration

- **No bridge component needed** — the component already uses React Query, just via the wrong package
- **Single commit** — no Redux cleanup step required
- **Simpler consumer update** — replace `Reader.useXxxQuery(param)` with `useQuery(xxxQuery(param))`

### Steps

1. **Create fetcher in `api-core`** — same pattern as Redux migration, but copy the API details from the `wpcomRequest` call in the data-stores hook instead of from a data-layer handler

2. **Create query options in `api-queries`** — same pattern. Preserve the same `queryKey` if possible for cache compatibility

3. **Update consumers** — replace the data-stores hook import with `useQuery` + query options:

**Before:**
```typescript
import { Reader } from '@automattic/data-stores';
const { data, isFetching } = Reader.useReadFeedSiteQuery( siteId );
```

**After:**
```typescript
import { readFeedSiteQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
const { data, isFetching } = useQuery( readFeedSiteQuery( siteId ) );
```

4. **Delete the old hook** from `packages/data-stores/src/reader/queries/` and remove its export from the Reader barrel file (`packages/data-stores/src/reader/index.ts`)

## Migrating Create / Update / Delete (Mutations)

Mutations follow the same package layout as queries but use `mutationOptions` + `useMutation`. Unlike read queries, mutations **do not need a bridge component** — the consumer calls `mutate()` directly.

### 1. Add the mutator in `api-core`

`packages/api-core/src/read-{name}/mutators.ts`:

```typescript
import { wpcom } from '../wpcom-fetcher';
import type { CreateXxxParams, XxxResponse } from './types';

export const createXxx = ( params: CreateXxxParams ): Promise< XxxResponse > => {
  return wpcom.req.post( {
    path: '/read/xxx/new',
    apiVersion: '1.2',
    body: params,
  } );
};

export const updateXxx = ( params: UpdateXxxParams ): Promise< XxxResponse > => {
  return wpcom.req.post( {
    path: `/read/xxx/${ params.owner }/${ params.slug }/update`,
    apiVersion: '1.2',
    body: params,
  } );
};

export const deleteXxx = ( owner: string, slug: string ): Promise< void > => {
  return wpcom.req.post( {
    path: `/read/xxx/${ owner }/${ slug }/delete`,
    apiVersion: '1.2',
    body: {},
  } );
};
```

Export from `packages/api-core/src/read-{name}/index.ts`:
```typescript
export * from './mutators';
```

### 2. Add the mutation in `api-queries`

`packages/api-queries/src/read-{name}.ts`:

```typescript
import { createXxx, deleteXxx, updateXxx } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const createXxxMutation = () =>
  mutationOptions( {
    mutationFn: createXxx,
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: readXxxListQuery().queryKey } );
    },
  } );

export const updateXxxMutation = () =>
  mutationOptions( {
    mutationFn: updateXxx,
    onSuccess: ( data ) => {
      queryClient.invalidateQueries( { queryKey: readXxxQuery( data.owner, data.slug ).queryKey } );
      queryClient.invalidateQueries( { queryKey: readXxxListQuery().queryKey } );
    },
  } );

export const deleteXxxMutation = () =>
  mutationOptions( {
    mutationFn: ( { owner, slug }: { owner: string; slug: string } ) => deleteXxx( owner, slug ),
    onSuccess: ( _data, { owner, slug } ) => {
      queryClient.removeQueries( { queryKey: readXxxQuery( owner, slug ).queryKey } );
      queryClient.invalidateQueries( { queryKey: readXxxListQuery().queryKey } );
    },
  } );
```

**Cache invalidation rules:**
- **Create**: invalidate the list query so the new item appears
- **Update**: invalidate the item query AND the list query
- **Delete**: `removeQueries` for the item query (it no longer exists), `invalidateQueries` for the list query
- **Follow/Unfollow**: invalidate the queries that read the follow state

Skipping invalidation is the most common bug — UI keeps stale data until manual refresh. Always identify which queries depend on the mutated resource.

### Prefer optimistic updates

The Redux + data-layer flow felt instant because Redux dispatched `RECEIVE` actions on success — the UI updated immediately without waiting for a refetch. **React Query mutations do NOT do this by default**: with `invalidateQueries` alone, the user sees a delay (the mutation request, then a separate refetch) before the UI reflects the change. This is a UX regression compared to the legacy Redux flow.

**Default to optimistic updates for any mutation that updates UI state the user will see.**

Use `onMutate` to update the cache immediately, and roll back in `onError`:

```typescript
export const updateXxxOptimisticMutation = () =>
  mutationOptions( {
    mutationFn: updateXxx,
    onMutate: async ( newValue ) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic write
      await queryClient.cancelQueries( { queryKey: readXxxQuery( newValue.id ).queryKey } );

      // Snapshot the previous value for rollback
      const previous = queryClient.getQueryData( readXxxQuery( newValue.id ).queryKey );

      // Optimistically write the new value
      queryClient.setQueryData( readXxxQuery( newValue.id ).queryKey, newValue );

      // Return context for onError
      return { previous };
    },
    onError: ( _err, variables, context ) => {
      if ( context?.previous ) {
        queryClient.setQueryData( readXxxQuery( variables.id ).queryKey, context.previous );
      }
    },
    onSettled: ( _data, _err, variables ) => {
      // Refetch to reconcile with server state, regardless of success/error
      queryClient.invalidateQueries( { queryKey: readXxxQuery( variables.id ).queryKey } );
    },
  } );
```

**Reference implementation:** `userPreferenceOptimisticMutation` in `packages/api-queries/src/me-preferences.ts` is the canonical example in this codebase.

**Optimistic patterns by mutation type:**
- **Create**: optimistically push the new item into the list cache; replace temp ID with real one in `onSuccess`
- **Update**: snapshot the item, write the new value, rollback on error
- **Delete**: optimistically remove the item from the list cache; restore on error
- **Follow/Unfollow**: optimistically flip the boolean in the cache; rollback on error

**When NOT to use optimistic updates:**
- Mutation result depends on server-computed data the client cannot predict (e.g., a generated slug, a server-assigned ID, a derived count). Either use a placeholder and reconcile in `onSuccess`, or skip optimistic and accept the delay.
- The mutation is rare/non-interactive (background sync, admin actions), where the extra complexity isn't justified.

**Always pair with `onSettled` invalidation** so the cache eventually reflects server truth, even if the optimistic value differs slightly.

### 3. Update the consumer component

```typescript
import { deleteXxxMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import page from '@automattic/calypso-router';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

function MyComponent( { item } ) {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const { mutate: deleteItem, isPending } = useMutation( deleteXxxMutation() );

  const handleDelete = () => {
    deleteItem(
      { owner: item.owner, slug: item.slug },
      {
        onSuccess: () => {
          page( '/reader' );
          dispatch( successNotice( translate( 'Deleted successfully.' ) ) );
        },
        onError: () => {
          dispatch( errorNotice( translate( 'Unable to delete.' ) ) );
        },
      }
    );
  };

  return <Button onClick={ handleDelete } disabled={ isPending } />;
}
```

**Where side effects live:**
- **Notices, navigation, Redux receive actions**: in the component's `onSuccess`/`onError` callbacks
- **Cache invalidation**: in the mutation's `onSuccess` (in api-queries)

This split keeps the mutation reusable (any consumer benefits from invalidation) while letting each consumer control its own UX (notices, redirects).

### 4. Clean up Redux in the same commit

Mutations differ from read queries: the bridge pattern isn't needed because nothing else reads "isCreating/isUpdating" from Redux once the consumer uses `isPending`. So you can:

- Remove the `READER_XXX_CREATE` / `_UPDATE` / `_DELETE` action types
- Remove the request action creators (`createReaderList`, `updateReaderList`, `deleteReaderList`)
- Remove the data-layer handlers
- Remove `isCreatingXxx` / `isUpdatingXxx` reducers and their selectors
- Keep the `RECEIVE` actions and reducers if other components still read the data from Redux — dispatch them from the component's `onSuccess`

### 5. Test the mutation

```typescript
nock( 'https://public-api.wordpress.com' )
  .post( '/rest/v1.2/read/xxx/owner/slug/delete' )
  .reply( 200 );

// In the test, render the component, click the button, then waitFor() the redirect or notice
```

Test checklist for mutations:
- [ ] Mock with `nock.post()` (or correct method)
- [ ] Verify success path: notice fires, navigation happens, queries invalidate
- [ ] Verify error path: error notice fires
- [ ] Verify `isPending` state disables the trigger

## Handling Request State Selectors

**Do NOT simply delete selectors that check request/loading state.** Grep for all consumers before removing any `isRequesting*` selector or reducer. Components may depend on them to show spinners, disable buttons, or conditionally render.

### Step 1: Find all consumers

```bash
grep -r "isRequestingXxx\|isRequesting.*Xxx" client/ --include="*.{ts,tsx,js,jsx}" -l
```

### Step 2: Replace Redux request state with React Query state

If a component reads `isRequestingXxx` from Redux, it now gets that state from the React Query hook instead:

**Before (Redux selector):**
```typescript
const isLoading = useSelector( isRequestingXxx );
```

**After (React Query):**
```typescript
const { isLoading } = useQuery( readXxxQuery() );
```

### Step 3: Migrate `connect()` HOC to hooks

If the component uses `connect()` to map `isRequesting*` state, convert to hooks:

**Before (`connect` HOC):**
```typescript
export default connect(
  ( state, ownProps ) => ( {
    items: getItems( state ),
    isLoading: state.reader.xxx.isRequestingXxx,
  } ),
  { requestXxx }
)( MyComponent );
```

**After (hooks):**
```typescript
export default function MyComponent( { someParam }: Props ) {
  const { data, isLoading } = useQuery( readXxxQuery( someParam ) );
  const items = useSelector( getItems );

  // isLoading now comes from React Query, not Redux
  if ( isLoading ) {
    return <Spinner />;
  }

  return <ItemList items={ items } />;
}
```

### Class components: keep `connect()` via a small HOC

The Reader still has many class components (`.jsx` extending `Component`/`PureComponent`) that read from Redux via `connect()`. **Do not rewrite class components into function components** as part of a data-fetching migration — that's a much bigger refactor and out of scope.

Instead, when a class component reads request state from Redux that is now sourced from React Query:

1. **Create a small wrapper HOC (or inline functional wrapper)** that uses `useQuery()` and forwards the result as props
2. **Keep the class component shape** — it still receives the same prop names it used to get from `mapStateToProps`
3. **Leave conversion to function component for a future, separate task**

**Pattern:**

```typescript
// Old: class component reading isRequesting from Redux
class MyClassComponent extends Component {
  render() {
    if ( this.props.isLoading ) return <Spinner />;
    return <ItemList items={ this.props.items } />;
  }
}

export default connect( ( state ) => ( {
  items: getItems( state ),
  isLoading: state.reader.xxx.isRequestingXxx, // <- comes from Redux
} ) )( MyClassComponent );
```

```typescript
// New: small functional wrapper bridges React Query into the class component's props
function MyClassComponentWithQuery( props ) {
  const { isLoading } = useQuery( readXxxQuery() );
  return <MyClassComponent { ...props } isLoading={ isLoading } />;
}

// connect() still maps Redux data; no longer maps isLoading
export default connect( ( state ) => ( {
  items: getItems( state ),
} ) )( MyClassComponentWithQuery );
```

**Why this matters:**
- Hooks (`useQuery`, `useSelector`) **cannot be called inside class components**
- Rewriting a class to a function component is a separate concern — mixing it into a data migration creates a large, hard-to-review diff
- The small wrapper isolates the React Query read while preserving the class component's contract

Decision tree:
- **Function component + `connect()`** -> convert to `useQuery()` + `useSelector()`, remove HOC (see next subsection)
- **Class component + `connect()`** -> add a functional wrapper for the query, keep `connect()` for Redux data

### Function components: replace `connect()` with hooks

**Key points for `connect()` -> hooks conversion:**
- `mapStateToProps` data selectors become `useSelector()` calls
- `mapStateToProps` request state selectors (`isRequesting*`) become destructured `useQuery()` state (`isLoading`, `isFetching`, `isError`)
- `mapDispatchToProps` request actions (like `requestXxx`) are removed entirely — React Query handles fetching
- `mapDispatchToProps` non-request actions (like UI actions) become `useDispatch()` + direct dispatch calls
- The component no longer needs to be wrapped — remove the `connect()` HOC entirely
- Add the query component's props as direct hook params (replace `ownProps` pattern)

**React Query loading states:**
- `isLoading` — first load, no cached data yet (equivalent to old `isRequesting` on first mount)
- `isFetching` — any fetch including background refetch (use for subtle indicators)
- `isPending` — no data yet (query disabled or first load)

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgetting to dispatch RECEIVE action | Components still read from Redux — the bridge is required |
| Wrong nock URL (missing `/rest/v1.2/` prefix) | Always use `https://public-api.wordpress.com/rest/v{version}/{path}` |
| Removing other handlers in the data-layer file | Only remove the specific REQUEST handler being migrated |
| Not adding `enabled` when query has required params | Query will fire with undefined params and fail |
| Putting cleanup in same commit as migration | Keep them separate for easier review and revert |
| Using `.jsx` instead of `.tsx` for new file | Always use TypeScript |
| Forgetting barrel exports in `index.ts` files | Must update both `api-core/src/index.ts` and `api-queries/src/index.ts` |
| Importing `wpcom` directly instead of from `../wpcom-fetcher` | Always import from the `wpcom-fetcher` module in api-core |
| Deleting `isRequesting*` selectors without checking consumers | Grep for all usages first — components may use them for spinners/disabled states |
| Leaving `connect()` HOC when request state moved to React Query | Convert to `useQuery()` + `useSelector()` hooks — remove the HOC entirely |
| Changing `queryKey` when migrating from data-stores | Preserve the same key array to avoid cache invalidation for users mid-session |
| Leaving the old data-stores hook export after migration | Delete the hook file AND remove it from the barrel export in `data-stores/src/reader/index.ts` |
| Migrating only the read query and leaving create/update/delete in Redux | Audit ALL actions for the resource first — partial migration creates two sources of truth |
| Forgetting to invalidate queries after a mutation | UI shows stale data until refresh — every mutation must invalidate the queries it affects |
| Putting notices/navigation inside the mutation's `onSuccess` in api-queries | Side effects belong in the consumer's `onSuccess` callback; only cache invalidation lives in api-queries |
| Using `invalidateQueries` for a deleted item's detail query | Use `removeQueries` for the deleted item; `invalidateQueries` for list queries |
| Creating a new fetcher when the endpoint already exists in `api-core` | Grep `packages/api-core/src/` for the path/function/module before creating — reuse or extend the existing one |
| Calling hooks inside a class component | Hooks can't run in classes — wrap the class with a small functional HOC that calls `useQuery()` and forwards props |
| Rewriting class to function component during a data migration | Out of scope — keep the class, bridge React Query via a wrapper, leave the conversion as a separate task |
| Migrating a user-facing mutation without optimistic updates | Redux's RECEIVE-on-success flow felt instant; pure `invalidateQueries` introduces a refetch delay — use `onMutate` + rollback to match the prior UX |
| Forgetting `cancelQueries` before optimistic write | An in-flight refetch can land after your optimistic write and overwrite it — always `await queryClient.cancelQueries` first |
| Skipping `onSettled` invalidation in an optimistic mutation | Without final reconciliation, optimistic value can drift from server truth — always invalidate after success or error |

## Quick Reference: Where Things Go

| What | Where |
|------|-------|
| API fetcher function | `packages/api-core/src/read-{name}/fetchers.ts` |
| Response types | `packages/api-core/src/read-{name}/types.ts` |
| Query options | `packages/api-queries/src/read-{name}.ts` |
| Bridge component | `client/components/data/query-reader-{name}/index.tsx` |
| Component tests | `client/components/data/query-reader-{name}/test/index.test.tsx` |
| Redux data-layer (to remove) | `client/state/data-layer/wpcom/read/{name}/index.js` |
| Redux actions (to remove request) | `client/state/reader/{name}/actions.ts` |
| Redux reducer (to remove isRequesting) | `client/state/reader/{name}/reducer.js` |
| Redux action types (to remove REQUEST) | `client/state/reader/action-types.ts` |
