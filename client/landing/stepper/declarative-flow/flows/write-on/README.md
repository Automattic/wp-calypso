# write-on flow

Phase 1 fake-door for the Write On experiment: handles the publish → signup →
site-creation → draft-transfer hand-off for a logged-out visitor who started
writing in the anonymous Write editor at `/write-editor` and clicked Publish.

## Feature flag

Gated by `calypso/write-on-flow`, enabled in all environments. The flag is
kept as a kill switch: when it is off, `initialize()` redirects to
`/setup/onboarding` before any steps mount.

## Flow

1. Read `localStorage['wpcom-write-anon-draft']` (set by the anon Write editor).
   If empty, redirect to `/setup/onboarding`. If the visitor is already
   authenticated, also redirect to `/setup/onboarding`.
2. Run the built-in signup step (auto-injected by `__experimentalUseBuiltinAuth`
   together with `stepsWithRequiredLogin`).
3. Create the new site (`STEPS.SITE_CREATION_STEP` + `STEPS.PROCESSING`).
4. POST the anon draft to the new site as a draft via the WP.com REST API.
5. Clear `localStorage['wpcom-write-anon-draft']` and redirect the user to the
   Write editor for the just-created draft on their new blog.

A flow refresh mid-signup re-reads the draft from localStorage, so the draft
survives reloads. The draft is only cleared after the POST succeeds.

## Testing instructions

1. Open devtools on any `calypso.localhost:3000` page (so the localStorage
   write lands on the right origin) and paste this into the console — the
   block markup matches what the anon editor's autosave will eventually
   write, so the Write editor opens the draft without a "classic editor"
   formatting modal:

   ```js
   localStorage.setItem('wpcom-write-anon-draft', JSON.stringify({title:'Test',content:`<!-- wp:paragraph --><p>Test</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Testing...</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Test more....</p><!-- /wp:paragraph -->`,ts:Date.now()}));
   ```

2. While logged out, visit `/setup/write-on`.
3. Complete signup; verify a new site is created and you land at
   `https://{newSlug}.wordpress.com/wp-admin/admin.php?page=write&post={id}`
   with the three paragraphs already loaded into the Write editor.
4. Verify `localStorage['wpcom-write-anon-draft']` is cleared.
5. Visit `/setup/write-on` again with no draft and confirm you are redirected
   to `/setup/onboarding`.
6. Visit `/setup/write-on` while logged in and confirm you are redirected to
   `/setup/onboarding`.

## Owned by

@allilevine

## Context

- Linear: READ-559 (full Phase 1 scope and cross-repo sequencing live there).
