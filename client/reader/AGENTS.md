# Reader

The Reader is the WordPress.com feed reader. It allows users to follow sites, discover content, manage subscriptions, like posts, and participate in conversations.

## Routes

See [README.md](./README.md) for the full list of Reader routes.

## Commands

```bash
yarn test-client client/reader/<path>        # Run Reader tests
yarn test-client:watch client/reader/<path>  # Run Reader tests in watch mode
```

## Architecture decisions

### Data fetching migration

The Reader is migrating from **Redux + data-layer** to **React Query** using the `@automattic/api-core` and `@automattic/api-queries` packages from the same codebase.

- **Legacy (Redux + data-layer)**: still present in most streams and core features.
- **Current (React Query)**: used in newer features like `discover/`, `new-subscription/`, and subscription management. New features should use `@automattic/api-core` for API definitions and `@automattic/api-queries` for React Query hooks.

### Mutation factories must accept the consumer's `QueryClient`

Calypso boots its own `QueryClient` (see `client/state/query-client.ts`, with a per-user persistence key) and injects it via `<QueryClientProvider>` in `client/controller/index.web.js`. The Dashboard, in contrast, uses the singleton exported by `@automattic/api-queries` (`packages/api-queries/src/query-client.ts`).

Because of that, **mutation factories defined in `@automattic/api-queries` must not reference the singleton `queryClient`** when used from the Reader. If they do, `onSuccess` handlers invalidate cache on the Dashboard's client instead of Calypso's, the active sidebar/page never sees the invalidation, and the underlying endpoint is never refetched after a mutation.

Pattern for any mutation factory whose `onSuccess` (or `onError`/`onMutate`) needs to call `invalidateQueries`, `setQueryData`, `removeQueries`, etc.:

```ts
// packages/api-queries/src/<resource>.ts
import { mutationOptions, type QueryClient } from '@tanstack/react-query';

export const fooMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: foo,
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: barQuery().queryKey } );
		},
	} );
```

Consumers in the Reader (and any other Calypso classic surface) pass `useQueryClient()` in:

```tsx
const queryClient = useQueryClient();
const { mutate } = useMutation( fooMutation( queryClient ) );
```

Query factories (`queryOptions(...)`) do **not** need this — they don't interact with the cache imperatively, and `useQuery` reads the active client from React context.

Example: every list mutation in `packages/api-queries/src/read-lists.ts` follows this pattern.

### Optimistic-mutation hardening checklist

Lessons from the Reader social mutations (CM-625 likes / CM-660 boost
/ CM-658 favorite). When you add a new optimistic mutation that
patches React Query caches, walk this list:

- **Scope the patcher to the right key namespace.** When wire IDs are
  protocol-instance-local (Mastodon status_ids are local to a connection's
  home instance), patching purely on `item.id === foo` across
  `queryClient.getQueriesData({ queryKey: keysRoot.all })` will
  cross-pollute. Filter the walk by `connectionId` (or whichever slot
  scopes the cache key for your protocol). The same applies to
  `cancelQueries` — pass a `predicate` rather than the broad root key.
- **Wrap `cancelQueries` in `try`/`catch` inside `onMutate`.** TanStack
  docs flag it as best-effort; if it rejects (rare — route-change
  teardown races), `onMutate` resolves to `undefined` and the actual
  mutationFn never runs. The optimistic patch + mutationFn must still
  fire if the cancel fails.
- **Add a `default:` arm to error-message switches.** TypeScript
  exhaustiveness keeps `MastodonError['kind']` / `AtmosphereError['kind']`
  switches complete today, but a future widening returns `undefined` →
  `errorNotice( undefined )` shows an empty toast. Repeat the generic
  copy in a `default:` arm.
- **`encodeURIComponent` path-interpolated wire IDs.** Even when the
  validator says today's IDs are URL-safe (numeric strings, etc.), the
  validator can widen — and a malformed `post.uri` flowing through a
  mapper bug shouldn't smuggle path segments. Cheap insurance.
- **`logToLogstash` lives in the client adapter, not in
  `packages/api-queries`.** The package can't import
  `calypso/lib/logstash` (lint-restricted). The pipeline-level error
  log belongs in the per-protocol adapter's `trackError` (or whatever
  surfaces the user-visible error notice).
- **Mock `calypso/lib/logstash` in tests that exercise error paths.**
  Otherwise it fires real HTTPS requests to wpcom and nock will
  complain about an unmocked request:
  ```ts
  jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );
  ```
- **Connection-scoped state, not global.** When connection identity
  matters for action-correctness (writing via a user's connected
  account), pass it explicitly down the panel → provider → button
  chain. Don't reach into Redux for "the current connection".

### Stream keys

Stream types are identified by unique keys. Examples of stream keys include `following`, `feed:{feedId}`, `site:{siteId}`, `tag:{tagSlug}`, `search:{json}`, `discover:*`, `conversations`, `conversations-a8c`, `p2`, `a8c`, `likes`, `recommendations_posts`, `recent`, `recent:{feedId}`, `list:{...}`, `user:{id}`, `tag_popular:{tag}`, and `custom_recs_*`. These keys index state in `state.reader.streams`.

### Post keys

Posts are identified by objects with `{blogId, postId}` (blog posts) or `{feedId, postId}` (external feed posts). Special variants include `{isRecommendationBlock, index}` for recommendation blocks and `{isPromptBlock, index}` for blogging prompts.

### Post cards

Post cards live in `client/blocks/reader-post-card/` with variants: `standard` (title, excerpt, image), `compact` (smaller layout for discovery), `photo` (image-focused), `gallery` (multiple images), and `conversation` (discussion thread).

### Page entrypoints

| Route                                             | Entrypoint                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| `/reader`                                         | `client/reader/following/main.tsx`                                        |
| `/reader/feeds/:feed_id`                          | `client/reader/feed-stream/`                                              |
| `/reader/blogs/:blog_id`                          | `client/reader/site-stream/`                                              |
| `/reader/feeds/:feed/posts/:post`                 | `client/reader/full-post/`                                                |
| `/reader/blogs/:blog/posts/:post`                 | `client/reader/full-post/`                                                |
| `/reader/a8c`                                     | `client/reader/a8c/main.jsx`                                              |
| `/reader/p2`                                      | `client/reader/p2/main.jsx`                                               |
| `/reader/search`                                  | `client/reader/search/`                                                   |
| `/reader/notifications`                           | `client/reader/notifications/`                                            |
| `/reader/new`                                     | `client/reader/new-subscription/`                                         |
| `/reader/subscriptions`                           | `client/reader/site-subscriptions-manager/`                               |
| `/reader/subscriptions/comments`                  | `client/reader/site-subscriptions-manager/comment-subscriptions-manager/` |
| `/reader/subscriptions/pending`                   | `client/reader/site-subscriptions-manager/pending-subscriptions-manager/` |
| `/reader/subscriptions/:id`                       | `client/reader/site-subscription/`                                        |
| `/reader/site/subscription/:blog_id`              | `client/reader/site-subscription/`                                        |
| `/reader/conversations`                           | `client/reader/conversations/`                                            |
| `/reader/list/*`                                  | `client/reader/list/`                                                     |
| `/discover/*`                                     | `client/reader/discover/`                                                 |
| `/tag/:tag`                                       | `client/reader/tag-stream/`                                               |
| `/tags`                                           | `client/reader/tags/`                                                     |
| `/activities/likes`                               | `client/reader/liked-stream/`                                             |
| `/reader/users/*`                                 | `client/reader/user-profile/`                                             |
| `/reader/atmosphere`                              | `client/reader/atmosphere/atmosphere-landing-view.tsx`                    |
| `/reader/atmosphere/connect`                      | `client/reader/atmosphere/atmosphere-connect-view.tsx`                    |
| `/reader/atmosphere/:id`                          | `client/reader/atmosphere/controller.tsx` (redirect handler)              |
| `/reader/atmosphere/:id/:tab`                     | `client/reader/atmosphere/atmosphere-account-view.tsx`                    |
| `/reader/atmosphere/:id/thread/:did/:rkey`        | `client/reader/atmosphere/atmosphere-thread-view.tsx`                     |
| `/reader/atmosphere/:id/profile/:actor`           | `client/reader/atmosphere/author-profile-view.tsx`                        |
| `/reader/atmosphere/:id/profile/:actor/followers` | `client/reader/atmosphere/followers-view.tsx`                             |
| `/reader/atmosphere/:id/profile/:actor/following` | `client/reader/atmosphere/following-view.tsx`                             |
| `/reader/mastodon`                                | `client/reader/mastodon/mastodon-landing-view.tsx`                        |
| `/reader/mastodon/connect`                        | `client/reader/mastodon/mastodon-connect-view.tsx`                        |
| `/reader/mastodon/oauth-callback`                 | `client/reader/mastodon/mastodon-oauth-callback-view.tsx`                 |
| `/reader/mastodon/:id`                            | `client/reader/mastodon/controller.tsx` (redirect handler)                |
| `/reader/mastodon/:id/:tab`                       | `client/reader/mastodon/mastodon-account-view.tsx`                        |
| `/reader/mastodon/:id/thread/:status_id`          | `client/reader/mastodon/mastodon-thread-view.tsx`                         |
| `/reader/mastodon/:id/profile/:actor`             | `client/reader/mastodon/author-profile-view.tsx`                          |
| `/reader/mastodon/:id/profile/:actor/followers`   | `client/reader/mastodon/followers-view.tsx`                               |
| `/reader/mastodon/:id/profile/:actor/following`   | `client/reader/mastodon/following-view.tsx`                               |
| `/reader/fediverse`                               | `client/reader/fediverse/fediverse-landing-view.tsx`                      |
| `/reader/fediverse/:id`                           | `client/reader/fediverse/controller.tsx` (redirect handler)               |
| `/reader/fediverse/:id/:tab`                      | `client/reader/fediverse/fediverse-account-view.tsx`                      |
| `/reader/fediverse/:id/profile/:actor`            | `client/reader/fediverse/author-profile-view.tsx`                         |
| `/reader/fediverse/:id/profile/:actor/followers`  | `client/reader/fediverse/followers-view.tsx`                              |
| `/reader/fediverse/:id/profile/:actor/following`  | `client/reader/fediverse/following-view.tsx`                              |

The likes/favorites count on `<SocialPostCard>` becomes an interactive
`<LikeButton>` (in `client/reader/social/components/post-card/like-button.tsx`)
when the host shell wraps the tree with a `<LikeProvider>` carrying a
per-protocol adapter hook. ATmosphere panels (timeline / thread / tag-feed)
wire `makeUseAtmosphereLikeAction(connection.id)`; Mastodon panels (timeline
/ thread / tag-feed) wire `makeUseMastodonLikeAction(connection.id)`.
Surfaces without a provider (quoted-post embeds, the shared
`SocialAuthorProfilePanel` until it forwards a provider, non-social
cards) fall back to the static count.

The reposts count likewise becomes an interactive `<RepostButton>` when
the host shell wraps the tree with `<RepostProvider>` carrying a
per-protocol adapter hook. ATmosphere panels (timeline / thread / tag-feed)
wire `makeUseAtmosphereRepostAction(connection.id)`; Mastodon panels (timeline
/ thread / tag-feed) wire `makeUseMastodonRepostAction(connection.id)` and
render the UK-spelled "Boost" label. Surfaces without a provider
(quoted-post embeds, the shared `SocialAuthorProfilePanel` until it
forwards a provider, non-social cards) fall back to the static count.

The reply / quote / standalone composer follows the same pattern with
`<ComposerProvider connectionId={…} config={…}>` from
`calypso/reader/social/composer`, plus per-protocol
`composer-config.tsx` files that supply a
`ComposerConfig<TError, TParams, TResult>`. Each protocol mounts the
provider once per view (account, thread, author-profile) alongside
`<ComposerModal />` and `<ComposeFab />`; panels that should render the
inline `<TimelineComposePill />` opt in via `useOptionalComposer()`. The
config carries a `useLimit(connectionId)` hook (ATmosphere returns its
static 300; Mastodon reads `max_characters` from the home instance via
`useMastodonInstanceConfigQuery` and falls back to 500), supported mode
kinds (both protocols support `'reply'`, `'quote'`, and `'standalone'`),
wire-shape `buildParams`, error-message map (with a
mandatory `default:` arm using `err satisfies never;` — same lesson as
the like / repost adapters), Tracks event names, success-notice copy,
optional `logBadRequest` (lives in the per-protocol adapter so
`packages/api-queries` doesn't need to import
`calypso/lib/logstash`), and an optional `useMedia` slot for media
attachments. The reply-button gate at `<PostCardCounts>` is
`analytics.onReplyClick`-only — the per-panel `onReplyClick` handler is
responsible for guarding on missing `post.cid` (or any protocol-specific
preconditions) before calling `openComposer`. See
`client/reader/social/AGENTS.md` § "Composer (slice 7)" for the full
contract.

### SSR file variants

Some routes have both `.node.js` (server) and `.web.js` (client) file variants for isomorphic rendering. Examples: `discover/index.node.js` / `discover/index.web.js`, `tags/index.node.js` / `tags/index.web.js`. The `.node.js` variant renders placeholder components for SSR, while `.web.js` uses `AsyncLoad` and full interactivity. When adding new routes that need SSR support, both variants are required.

### Analytics

Reader events use the `calypso_reader_*` prefix. Use the `recordReaderTracksEvent` Redux action for tracking — `recordTrack()` from `client/reader/stats` is deprecated. Every event automatically includes a `ui_algo` property derived from route pattern matching in `client/reader/stats/index.ts`.

### URL builders

Reuse the URL builders from `client/reader/route/index.js` instead of constructing Reader URLs manually: `getPostUrl(post)`, `getFeedUrl(feedId)`, `getSiteUrl(siteId)`, `getTagStreamUrl(tag)`. `getPostUrl()` automatically selects the correct format based on `feed_ID`, `site_ID`, and `is_external` flags.

### Post display types

Post display types in `client/state/reader/posts/display-types.js` are **bitwise flags** (not a mutually exclusive enum). They can be combined with XOR (`^=`): `PHOTO_ONLY` (1), `GALLERY` (32), `FEATURED_VIDEO` (512), `X_POST` (1024), etc.

### Post normalization pipeline

Post normalization (`client/state/reader/posts/normalization-rules.js`) runs in two phases: **fast rules** (synchronous — decoding, HTML stripping, content sanitization) and **slow rules** (asynchronous — waits for images to load, classifies display type, detects Reddit posts). New normalization rules must be added to the correct phase.

### Shared code boundaries

The Reader owns `client/reader/` but depends on shared code that other clients also use. Be aware of the impact when modifying:

- `client/state/reader/` — Reader Redux state. Owned by Reader, but consumed by other parts of Calypso.
- `client/blocks/reader-post-card/` — post card components. Used by Reader and Discover.
- `client/blocks/reader-full-post/` — full post view. Shared across Reader surfaces.
- `client/components/post-excerpt/` — shared post excerpt component.
- `client/state/data-layer/wpcom/read/` — legacy API handlers. Do not add new handlers here; use `@automattic/api-queries` instead.

## Boundaries (for new code)

- Do not use the `connect` HOC — use `useSelector`/`useDispatch` hooks instead.
- Do not add new Redux data-layer handlers — use `@automattic/api-queries` for new API calls.
- Use `useTranslate()` from `i18n-calypso` — the `localize` HOC is legacy.
- Use `renderWithProvider` from `calypso/test-helpers/testing-library` for Redux-dependent test components.
- Prefer `nock` for HTTP mocking over mocking components — test real component behavior with mocked API responses.
- Use [ARIA-based queries](https://testing-library.com/docs/queries/about/) (`getByRole`, `getByLabelText`) to locate elements instead of CSS selectors or test IDs.
- Use [`userEvent`](https://testing-library.com/docs/user-event/intro) instead of `fireEvent` for simulating user interactions.
- For test declarations, follow the existing style in the surrounding file/project and be consistent about using `it()` or `test()`.
- Set up userEvent with `const user = userEvent.setup()` and call `user.click()` instead of `userEvent.click()` directly.
- Prefer `@wordpress/components` primitives (Button, Modal, Card, Icon, VStack, HStack) over custom HTML elements with custom CSS.
- Use layout components (VStack, HStack, Spacer, Grid) to build layouts instead of custom CSS.
- Do not use `@automattic/components` — it is deprecated.
- Always use TypeScript (`.tsx`) and functional components for new components.
- Do not export component prop types. Consumers should use `React.ComponentProps<typeof Component>` to extract props.
- Use named exports for new components instead of default exports.
- New components must have accompanying tests.
