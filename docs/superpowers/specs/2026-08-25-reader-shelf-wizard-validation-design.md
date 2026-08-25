# Reader Shelf Wizard Validation Design

## Goal

Keep the create wizard navigable after a user exceeds a feed, tag, or language limit, without weakening validation at submission time.

## Design

The create wizard's intermediate Next button will be disabled only by validation errors belonging to the visible step. Identity checks the name, Feeds checks the feed count, and Layout has no field validation. The final Topics step uses the aggregate validation state before creating the shelf.

Edit mode will continue using aggregate validation because Save submits the entire draft from any tab. `handleSave` will retain its aggregate guard as defense against direct invocation.

## Testing

Add a create-wizard regression test that exceeds the topic limit, goes back to the preceding step, and verifies Next remains enabled so the user can return to Topics and correct the draft. Run the complete customize-modal test directory, changed-file lint, and diff checks.

## Scope

No validation copy, backend limits, edit-mode behavior, or mutation payloads change.
