# domain-transfer flow

Bulk domain transfer: a logged-in user unlocks their domains at the current registrar, enters the domain names and authorization codes, and checks out.

## Testing instructions

1. Go to /setup/domain-transfer.
2. Verify the page uses the default WordPress.com top bar. Add `?back_to=https://my.wordpress.com/domains` and verify a "Back" button appears in the top bar and leads there.
3. Click "Get Started", add a domain and authorization code, and continue to checkout.
4. Go to /setup/hundred-year-domain-transfer/domains on desktop and at phone width. Verify there is a single WordPress.com wordmark at the top (no extra W logo), the dark header starts at the top edge, and the loading screen shown before the step mounts is unchanged.

## Owned by

@alshakero (Tentative - automatically generated from the last committer)

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
