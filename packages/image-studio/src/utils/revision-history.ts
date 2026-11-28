/**
 * Revision history shared by the revision navigator, the navigate-revision
 * ability and the agent's client context.
 */
import type { AttachmentRecord } from '../types/wordpress.d';

export interface Revision {
	id: number;
	url: string;
	date: string;
}

export interface RevisionHistoryIds {
	originalAttachmentId: number | null;
	currentAttachmentId: number | null;
	draftIds: number[];
	savedAttachmentIds: number[];
	annotatedIds: number[];
}

export interface RevisionHistory {
	revisions: Revision[];
	/** 0-based index of the current attachment in `revisions`, or -1 when it isn't there. */
	currentIndex: number;
	canGoBack: boolean;
	canGoForward: boolean;
}

/**
 * Build the list of revisions the canvas can move between, oldest first.
 *
 * Annotated images and attachments whose record hasn't loaded yet are left out.
 * @param ids           - The attachment ids from the Image Studio store
 * @param getAttachment - Returns the loaded attachment record for an id, if any
 * @returns The revisions and where the current attachment sits among them
 */
export function getRevisionHistory(
	ids: RevisionHistoryIds,
	getAttachment: ( id: number ) => AttachmentRecord | null | undefined
): RevisionHistory {
	const { originalAttachmentId, currentAttachmentId, draftIds, savedAttachmentIds, annotatedIds } =
		ids;

	const allAttachmentIds = new Set< number | null >( [
		originalAttachmentId,
		currentAttachmentId,
		...draftIds,
		...savedAttachmentIds,
	] );

	const revisions = Array.from( allAttachmentIds )
		.map( ( id ) => {
			if ( ! id || annotatedIds.includes( id ) ) {
				return null;
			}

			const attachment = getAttachment( id );
			if ( ! attachment ) {
				return null;
			}

			return {
				id: attachment.id,
				url: attachment.source_url,
				date: attachment.date,
			};
		} )
		.filter( ( item ): item is Revision => !! item )
		.sort( ( a, b ) => new Date( a.date ).getTime() - new Date( b.date ).getTime() );

	const currentIndex = revisions.findIndex( ( revision ) => revision.id === currentAttachmentId );

	return {
		revisions,
		currentIndex,
		canGoBack: revisions.length > 1 && currentIndex > 0,
		canGoForward: revisions.length > 1 && currentIndex < revisions.length - 1,
	};
}
