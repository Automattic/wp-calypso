/**
 * Shared identity of the clip a share-hook should act on.
 *
 * Surfaces that read the clip from somewhere other than the in-memory
 * video-studio store (e.g. the post-editor sidebar, which reads the
 * meta-bound clip) pass this in explicitly. Modal call sites omit it and
 * fall back to the store. `durationSeconds` is optional because not every
 * caller has it (the sidebar can resolve it from the attachment, but it's
 * not required for the generic Web Share path).
 */
export interface ShareClipIdentity {
	url: string | null;
	attachmentId: number | null;
	durationSeconds?: number | null;
}
