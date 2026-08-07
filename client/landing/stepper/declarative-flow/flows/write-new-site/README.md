# write-new-site flow

Lets a logged-in user create a brand-new WordPress.com site and land straight in
the Write editor. Linked from the "Start a new site" path on the write-editor
site picker (`/write-editor`), which is reachable only by authenticated users.

This is the logged-in counterpart to the [`write-on`](../write-on/README.md)
flow. `write-on` is a logged-out fake door tied to an anonymous draft and
rejects authenticated users; `write-new-site` has no draft hand-off and is
built for the already-logged-in case.

## Flow

1. Run the built-in signup step (auto-injected by `__experimentalUseBuiltinAuth`
   together with `stepsWithRequiredLogin`). Write-editor visitors are already
   authenticated, so this is a no-op for them.
2. Create the new site (`STEPS.SITE_CREATION_STEP` + `STEPS.PROCESSING`). No
   plan or domain step — a free site is created.
3. Redirect the user to the Write editor of the new site:
   `https://{newSlug}/wp-admin/admin.php?page=write`.

## Source param

The picker links here with a `source` token (e.g. `/setup/write-new-site?source=write_editor`).
Stepper preserves the query string across steps, so the flow forwards `source`
into the final editor redirect (`…admin.php?page=write&source={source}`). The
Write editor (`jetpack-mu-wpcom` `write.php`) reads `source` for its back-button
destination and `wpcom_write_editor_open` Tracks event. `source` is also added
to this flow's `calypso_write_new_site_flow_site_created` event.

Signup attribution (`ref`) is captured automatically by Stepper's signup Tracks
and does not need to be forwarded to the editor.

## Testing instructions

1. While logged in, visit `/setup/write-new-site`.
2. Verify a new free site is created and you land at
   `https://{newSlug}.wordpress.com/wp-admin/admin.php?page=write` with the
   Write editor open on a fresh post.

## Owned by

@allilevine

## Context

- Linear: CM-859
