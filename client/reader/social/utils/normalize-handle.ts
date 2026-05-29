/**
 * Strip leading `@`s from a social handle for display.
 *
 * Mastodon handles arrive shaped as `@user@instance` (one leading `@`);
 * ATproto handles have no leading `@`. Both views render the handle
 * inside an `@%(handle)s` template, so any leading `@` on the input
 * would double up in the rendered string. Strip all leading `@`s rather
 * than a single one so a malformed upstream value (`@@user@instance`)
 * still renders as `@user@instance` instead of `@@user@instance`.
 */
export function normalizeHandle( handle: string ): string {
	return handle.replace( /^@+/, '' );
}
