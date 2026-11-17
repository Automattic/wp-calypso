# Mutations (Create / Update / Delete)

Mutations follow the same package layout as queries but use `mutationOptions` + `useMutation`. Unlike read queries, mutations **do not need a bridge component** — the consumer calls `mutate()` directly.

## 1. Add the mutator in `api-core`

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

## 2. Add the mutation in `api-queries`

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

Skipping invalidation is the most common bug — UI keeps stale data until manual refresh.

## 3. Prefer optimistic updates

The Redux + data-layer flow felt instant because Redux dispatched `RECEIVE` actions on success — the UI updated immediately without waiting for a refetch. **React Query mutations do NOT do this by default**: with `invalidateQueries` alone, the user sees a delay (the mutation request, then a separate refetch) before the UI reflects the change. This is a UX regression compared to the legacy Redux flow.

**Default to optimistic updates for any mutation that updates UI state the user will see.**

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

**Reference implementation:** `userPreferenceOptimisticMutation` in `packages/api-queries/src/me-preferences.ts`.

**Optimistic patterns by mutation type:**
- **Create**: optimistically push the new item into the list cache; replace temp ID with real one in `onSuccess`
- **Update**: snapshot the item, write the new value, rollback on error
- **Delete**: optimistically remove the item from the list cache; restore on error
- **Follow/Unfollow**: optimistically flip the boolean in the cache; rollback on error

**When NOT to use optimistic updates:**
- Mutation result depends on server-computed data the client cannot predict (generated slug, server-assigned ID, derived count). Use a placeholder + reconcile in `onSuccess`, or skip optimistic and accept the delay.
- Rare/non-interactive mutations (background sync, admin actions) where extra complexity isn't justified.

**Always pair with `onSettled` invalidation** so the cache eventually reflects server truth.

## 4. Update the consumer component

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
- **Notices, navigation, Redux receive actions**: in the **consumer**'s `onSuccess`/`onError` callbacks
- **Cache invalidation**: in the **mutation**'s `onSuccess` (in api-queries)

This split keeps the mutation reusable while letting each consumer control its own UX.

## 5. Clean up Redux in the same commit

Mutations don't need the bridge pattern — nothing else reads "isCreating/isUpdating" from Redux once the consumer uses `isPending`. Remove:

- `READER_XXX_CREATE` / `_UPDATE` / `_DELETE` action types
- Request action creators (`createReaderList`, `updateReaderList`, `deleteReaderList`)
- Data-layer handlers
- `isCreatingXxx` / `isUpdatingXxx` reducers and selectors

**Keep** the `RECEIVE` actions and reducers if other components still read the data from Redux — dispatch them from the consumer's `onSuccess`.

## 6. Test the mutation

```typescript
nock( 'https://public-api.wordpress.com' )
  .post( '/rest/v1.2/read/xxx/owner/slug/delete' )
  .reply( 200 );
```

Test checklist:
- [ ] Mock with correct method (`nock.post()` for POST, etc.)
- [ ] Verify success path: notice fires, navigation happens, queries invalidate
- [ ] Verify error path: error notice fires
- [ ] Verify `isPending` state disables the trigger
