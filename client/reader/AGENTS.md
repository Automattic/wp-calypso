# Reader

The Reader is the WordPress.com feed reader. It allows users to follow sites, discover content, manage subscriptions, like posts, and participate in conversations.

## Routes

See [README.md](./README.md) for the full list of Reader routes.

## Commands

```bash
yarn test-client client/reader/<path>  # Run Reader tests
```

## Architecture decisions

### Data fetching migration

The Reader is migrating from **Redux + data-layer** to **React Query** using the `@automattic/api-core` and `@automattic/api-queries` packages from the same codebase.

- **Legacy (Redux + data-layer)**: still present in most streams and core features.
- **Current (React Query)**: used in newer features like `discover/`, `new-subscription/`, and subscription management. New features should use `@automattic/api-core` for API definitions and `@automattic/api-queries` for React Query hooks.

### Stream keys

Stream types are identified by unique keys. Examples of stream keys include `following`, `feed:{feedId}`, `site:{siteId}`, `tag:{tagSlug}`, `search:{json}`, `discover:*`, `conversations`, `conversations-a8c`, `p2`, `a8c`, `likes`, `recommendations_posts`, `recent`, `recent:{feedId}`, `list:{...}`, `user:{id}`, `tag_popular:{tag}`, and `custom_recs_*`. These keys index state in `state.reader.streams`.

### Post keys

Posts are identified by objects with `{blogId, postId}` (blog posts) or `{feedId, postId}` (external feed posts). Special variants include `{isGap, from, to}` for temporal gaps in the stream, `{isRecommendationBlock, index}` for recommendation blocks, and `{isPromptBlock, index}` for blogging prompts.

### Post cards

Post cards live in `client/blocks/reader-post-card/` with variants: `standard` (title, excerpt, image), `compact` (smaller layout for discovery), `photo` (image-focused), `gallery` (multiple images), and `conversation` (discussion thread).

## Boundaries

- Do not use the `connect` HOC — use `useSelector`/`useDispatch` hooks instead.
- Do not add new Redux data-layer handlers — use `@automattic/api-queries` for new API calls.
- Use `useTranslate()` from `i18n-calypso` — the `localize` HOC is legacy.
- Use `renderWithProvider` from `calypso/test-helpers/testing-library` for Redux-dependent test components.
- Prefer `nock` for HTTP mocking over mocking components — test real component behavior with mocked API responses.
- Prefer `@wordpress/components` primitives (Button, Modal, Card, Icon, VStack, HStack) over custom HTML elements with custom CSS.
