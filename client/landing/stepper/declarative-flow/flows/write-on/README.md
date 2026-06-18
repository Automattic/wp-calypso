# write-on flow

Phase 1 fake-door for the Write On experiment: handles the publish → signup →
site-creation → draft-transfer hand-off for a logged-out visitor who started
writing in the anonymous Write editor at `/write-editor` and clicked Publish.

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

1. Open devtools and set a draft in localStorage:

   ```js
   localStorage.setItem(
   	'wpcom-write-anon-draft',
   	JSON.stringify( { title: 'Hello world', content: 'My first post.', ts: Date.now() } )
   );
   ```

2. While logged out, visit `/setup/write-on`.
3. Complete signup; verify a new site is created and you land on the Write
   editor for a draft titled "Hello world" on the new blog.
4. Verify `localStorage['wpcom-write-anon-draft']` is cleared.
5. Visit `/setup/write-on` again with no draft and confirm you are redirected
   to `/setup/onboarding`.
6. Visit `/setup/write-on` while logged in and confirm you are redirected to
   `/setup/onboarding`.

## Owned by

@allilevine

## Context

- Linear: READ-559 (full Phase 1 scope and cross-repo sequencing live there).
