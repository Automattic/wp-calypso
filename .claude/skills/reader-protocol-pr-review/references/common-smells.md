# Reader Protocol PR — Common Smells

Recurring review findings from the CM-625 / CM-658 / CM-660 / CM-662 slice cycle. Walk this list before submitting a review of any Reader social/atmosphere/mastodon PR.

## 1. Component returns `null` when its provider is absent — empty-cell regression

**Symptom**: A component that's interactive when wrapped in a provider (`<LikeProvider>`, `<RepostProvider>`) returns `null` when the provider is missing. The parent's gate then produces an empty cell when a panel passes `connectionId` without also mounting the provider.

**Concrete example**: CM-658's first round had `<LikeButton>` returning `null` when `!action.supported` while `<PostCardCounts>` gated only on `connectionId`. A surface that opted into `connectionId` but forgot the provider got a blank space where the like count used to be.

**Fix**: Render the static-count fallback inside the button itself (icon + count + screen-reader text). Drop the corresponding ternary in `<PostCardCounts>` so the button is rendered unconditionally — it decides interactive vs static internally.

**Where to check**:
- `client/reader/social/components/post-card/like-button.tsx`
- `client/reader/social/components/post-card/repost-button.tsx`
- `client/reader/social/components/post-card/post-card-counts.tsx`

## 2. Cross-tenant cache poisoning in optimistic patcher

**Symptom**: The optimistic-update walker uses `queryClient.getQueriesData({ queryKey: keysRoot.all })` and patches every cached item whose ID matches. When wire IDs are tenant-scoped (Mastodon status_ids are local to a connection's home instance), the same numeric ID on connection A and B is two different posts — but the patcher flips both.

**Concrete example**: CM-660's `patchMastodonPostCaches(queryClient, statusId, patch)` walked all `readerMastodonKeys.all` queries. A user with two connections (mastodon.social + infosec.exchange) where both surface a status with the same numeric id: boosting on connection A flipped `viewer.reblogged: true` on B's caches — without any HTTP fire on B.

**Fix**: Add a connection scope. Cache keys carry `connectionId` at a known slot (slot 3 for Mastodon; check the `query-keys.ts` shape). Filter the walk:

```ts
function isQueryKeyForConnection( key: unknown, connectionId: number ): boolean {
    return Array.isArray( key ) && key[ 3 ] === connectionId;
}

function patchPostCaches( queryClient, connectionId, statusId, patch ) {
    for ( const [ key, data ] of queryClient.getQueriesData({ queryKey: keysRoot.all }) ) {
        if ( ! isQueryKeyForConnection( key, connectionId ) ) continue;
        // ... patch
    }
}
```

**Where to check**: `packages/api-queries/src/reader-{atmosphere,mastodon}.ts` — the `patch{Atmosphere,Mastodon}PostCaches` helper.

## 3. `cancelQueries` over-broad and not wrapped

**Symptom**: `onMutate` does `await queryClient.cancelQueries({ queryKey: keysRoot.all })` without a try/catch. Two issues:

1. Cancels ALL in-flight Mastodon/Atmosphere queries — boosting on one post kills timeline pagination, thread loads, profile fetches across all connections.
2. If `cancelQueries` rejects (rare; route-change teardown), `onMutate` resolves to `undefined` and the actual mutationFn never runs.

**Fix**: Scope via predicate AND wrap in try/catch:

```ts
function cancelQueriesForConnection( queryClient, connectionId ) {
    return queryClient.cancelQueries( {
        predicate: ( q ) => isQueryKeyForConnection( q.queryKey, connectionId ),
    } );
}

onMutate: async ( vars ) => {
    try {
        await cancelQueriesForConnection( queryClient, connectionId );
    } catch {
        // Best-effort per TanStack docs. The optimistic patch + mutationFn must still run.
    }
    return patchPostCaches( ... );
},
```

## 4. Path-interpolated wire IDs without `encodeURIComponent`

**Symptom**: A fetcher does ``path: `/foo/${ params.id }/bar`` `` without encoding. Today's IDs are URL-safe; tomorrow's mapper bug, validator widening, or malformed wire payload smuggles path segments.

**Fix**: Always wrap user-derived path segments in `encodeURIComponent`:

```ts
path: `/reader/mastodon/connections/${ params.connectionId }/likes/${ encodeURIComponent(
    params.statusId
) }`,
```

**Where to check**: every fetcher in `packages/api-core/src/reader-{atmosphere,mastodon}/fetchers.ts`. Look for any `${ ... }` in a `path:` field that isn't trivially a number.

## 5. Error-message switch missing `default:` arm

**Symptom**: An `errorMessageFor*` function switches over `MastodonError['kind']` / `AtmosphereError['kind']` exhaustively — TypeScript keeps it complete today. But if the union widens before the switch is updated, the function returns `undefined` and `errorNotice( undefined )` shows an empty toast.

**Fix**: Add a `default:` arm that returns the generic copy:

```ts
default:
    // Defensive fallback if the union widens before this switch is updated.
    return translate( 'Could not save your boost. Please try again.' );
```

**Where to check**: `client/reader/{atmosphere,mastodon}/use-{protocol}-{like,repost}-action.ts`.

## 6. Mutation `onError` doesn't log; observability lives only in caller

**Symptom**: The user-facing toast lives in the *caller's* `onError` (passed to `mutate({...}, { onError })`). If a future consumer forgets to pass `{ onError }`, the failure is completely silent — cache rolls back, but the user sees their action vanish with no explanation.

**Fix**: Add `logToLogstash` in the per-protocol adapter's `trackError` (which is the path the caller's onError dispatches through):

```ts
const trackError = ( error, direction ) => {
    dispatch( errorNotice( errorMessageFor( error, translate ) ) );
    analytics?.onClick( `calypso_reader_${ source }_${ action }_error_shown`, { ... } );
    logToLogstash( {
        feature: 'calypso_client',
        message: `Reader ${ Protocol } ${ direction } mutation failed`,
        severity: 'error',
        extra: { type: `reader_${ protocol }_${ direction }_mutation_error`, ... },
    } );
};
```

**Note**: `calypso/lib/logstash` is **lint-restricted from `packages/api-queries`**. The pipeline-level log lives in the per-protocol adapter (under `client/reader/{atmosphere,mastodon}/`), not in the api-queries mutation hook itself.

**Test mock**: any test that exercises an error path needs:

```ts
jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );
```

Otherwise nock complains about an unmocked HTTPS request.

## 7. Silent no-op on derived-value miss (rkey extraction returning null)

**Symptom**: ATmosphere's `unlike()` / `unrepost()` derive `rkey = rkeyFromUri( post.viewer?.like )`. If extraction fails (sentinel still in flight, malformed wire payload), the function silently returns. The button stays in the "liked" state from the user's perspective, and there's no observability.

**Fix**: Surface to the user AND log:

```ts
const unlike = () => {
    const rkey = rkeyFromUri( post.viewer?.like ?? '' );
    if ( ! rkey ) {
        dispatch( errorNotice( translate( "We couldn't undo your like. Please try again in a moment." ) ) );
        logToLogstash( {
            feature: 'calypso_client',
            message: 'Atmosphere unlike: rkey not derivable from viewer.like',
            severity: 'warning',
            extra: { type: 'reader_atmosphere_unlike_rkey_missing', post_uri: post.uri, viewer_like: post.viewer?.like ?? null },
        } );
        analytics?.onClick( `calypso_reader_${ source }_unlike_rkey_missing`, { ... } );
        return;
    }
    // ... normal path
};
```

## 8. Wire-shape coercion (`?? ''`) hiding upstream bugs

**Symptom**: `create.mutate({ postUri: post.uri, postCid: post.cid ?? '' })`. The previous render-gate (`post.cid` truthy) is gone; without a guard, an atmosphere post without a `cid` would now POST `cid: ''`.

**Fix**: Guard at the start of the action callback. Bail silently — rendering the button without a cid is a panel-wiring bug, not a user error:

```ts
const repost = () => {
    if ( ! post.cid ) {
        return;
    }
    // ... normal path
};
```

## 9. Dead surface area on `*Action` interfaces

**Symptom**: `LikeAction` interface declares `error: { kind: string } | null` and `label.action: TranslateResult`. Both adapters dutifully compute them every render. No consumer reads either.

**Fix**: Drop the field from the interface and both adapters. YAGNI.

**Counter-example**: `RepostAction.label.action` IS consumed — it's rendered as the dropdown menu item label ("Repost" / "Boost"). Verify usage before suggesting a drop.

## Architectural follow-ups (defer, don't block PR)

These showed up in reviews but span multiple slices and warrant their own discussion:

- **Cross-component pending sentinel for Mastodon.** Mastodon mutations have no analog of atmosphere's `PENDING_LIKE_URI` / `PENDING_REPOST_URI` sentinels that propagate optimistic-pending across cached surfaces. Two surfaces (timeline + thread) seeing the same post can fire concurrent mutations.
- **`onSettled` reconciliation.** Optimistic patches stay in cache until `staleTime`; rapid click sequences drift counts. A delayed `invalidateQueries` after success would reconcile.
- **Schema validation on Mastodon responses.** Hostile or compromised home instance can return malformed booleans/numbers; current code casts `as MastodonTimelinePage` and trusts the wire. A small validator at the wpcom-fetcher boundary would close this.
- **`logError` upstream of `classifyMastodonError`.** The classifier collapses non-network errors to `kind: 'unknown'` and the original stack/cause is lost. A `logError` before the throw would preserve it for debugging.

When you spot one in a review, file as a follow-up issue covering the pattern (not a single slice). The fix typically lands across both atmosphere and Mastodon simultaneously.
