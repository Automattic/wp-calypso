# Fix stale “Setting up your custom domain” notice after detach

**Issue:** DOTMSD-1347

## Problem

In the multi-site Dashboard, attaching a domain to a site and then immediately
detaching it leaves a stale “Setting up your custom domain” notice on screen.
The UI eventually stabilizes on its own.

### Root cause

The site domains page (`client/dashboard/sites/domains/index.tsx`) renders from
the **list** query `domainsQuery()` → query key `[ 'domains', undefined ]`. The
notice shows whenever a domain in that list satisfies `isPendingPrimaryDomain`
(`client/dashboard/utils/domain.ts`): `can_set_as_primary && ! primary_domain &&
…`.

The detach and attach mutations only invalidate the **single-domain** key:

- `disconnectDomainMutation` (`packages/api-queries/src/domain.ts`) invalidates
  `[ 'domains', <name> ]`.
- `transferDomainToSiteMutation` (`packages/api-queries/src/domain-transfer.ts`)
  invalidates `[ 'domains', <name> ]`.

TanStack Query invalidation is prefix-matched, and `[ 'domains', <name> ]` does
**not** match `[ 'domains', undefined ]`. So the list keeps serving the stale
cached entry (old `blog_id`, `can_set_as_primary: true`, `primary_domain:
false`), `isPendingPrimaryDomain` stays true, and the notice lingers until some
unrelated refetch (route remount, window focus, or the notice’s own 5s poll)
finally refreshes the list — hence “eventually stabilizes on its own.”

The correct pattern already exists in the same package:
`siteSetPrimaryDomainMutation` and `startDomainInboundTransferMutation` both
invalidate the broad `{ queryKey: [ 'domains' ] }` prefix, which matches both
the single-domain and list keys.

## Fix

In both mutations’ `onSuccess`, invalidate the broad `{ queryKey: [ 'domains' ]
}` prefix instead of the single-domain key. The `[ 'domains' ]` prefix matches
both `[ 'domains', <name> ]` and `[ 'domains', undefined ]`, so both the detail
and list caches refresh.

- `packages/api-queries/src/domain.ts` — `disconnectDomainMutation`: replace
  `queryClient.invalidateQueries( domainQuery( domainName ) )` with
  `queryClient.invalidateQueries( { queryKey: [ 'domains' ] } )`.
- `packages/api-queries/src/domain-transfer.ts` —
  `transferDomainToSiteMutation`: replace
  `queryClient.invalidateQueries( domainQuery( domain ) )` with
  `queryClient.invalidateQueries( { queryKey: [ 'domains' ] } )`.

## Testing (unit)

New test file `packages/api-queries/src/__tests__/domain-invalidation.test.tsx`:

- `jest.mock( '@automattic/api-core' )` so the mutation functions resolve
  without hitting the network.
- Spy on the singleton `queryClient.invalidateQueries` (imported from
  `../query-client`).
- Run each mutation via `useMutation` + `renderHook` + `mutateAsync`.
- Assert the spy was called with `{ queryKey: [ 'domains' ] }` for both
  `disconnectDomainMutation` and `transferDomainToSiteMutation`.

## Non-goals / risks

- Scope is deliberately limited to the two mutations behind this bug. Not
  touching the site query on detach, and not auditing every other domain
  mutation.
- The notice’s own 5s poll + “now your primary address” snackbar path is left
  as-is. Once the list refreshes, the notice unmounts and the poll stops, so no
  spurious snackbar fires.
- The broad `[ 'domains' ]` invalidation is slightly wider (also refetches
  `[ 'domains', 'bulk-actions' ]` etc.), but that is the established, accepted
  pattern in this package.
