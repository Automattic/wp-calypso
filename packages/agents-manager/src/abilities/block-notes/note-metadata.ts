type Metadata = Record< string, unknown >;

const asMetadata = ( metadata: unknown ): Metadata =>
	metadata && typeof metadata === 'object' ? ( metadata as Metadata ) : {};

/** Note ids a block links to. `metadata.noteId` is a number or an array of numbers. */
export function getNoteIds( metadata: unknown ): number[] {
	const raw = asMetadata( metadata ).noteId;
	const values = Array.isArray( raw ) ? raw : [ raw ];
	const ids: number[] = [];

	for ( const value of values ) {
		const id = Number( value );
		if ( Number.isFinite( id ) && id > 0 && ! ids.includes( id ) ) {
			ids.push( id );
		}
	}

	return ids;
}

export function withFirstNoteId( metadata: unknown, noteId: number ): Metadata {
	return { ...asMetadata( metadata ), noteId };
}

/** Plain text of a comment's `content` field. */
export function noteText( content: unknown ): string {
	const { raw, rendered } = ( content ?? {} ) as { raw?: unknown; rendered?: unknown };
	const html = typeof raw === 'string' ? raw : rendered;

	if ( typeof html !== 'string' ) {
		return '';
	}

	const doc = new DOMParser().parseFromString( html, 'text/html' );

	return ( doc.body.textContent ?? '' ).trim();
}

/** `auto-draft` has no saved notes yet; `unsupported` is a non-post editor such as the site editor. */
export type PostRef = number | 'auto-draft' | 'unsupported' | undefined;

export function toPostRef( id: unknown, status: unknown ): PostRef {
	if ( status === 'auto-draft' ) {
		return 'auto-draft';
	}

	if ( id === undefined || id === null || id === '' ) {
		return undefined;
	}

	const numeric = Number( id );

	return Number.isInteger( numeric ) && numeric > 0 ? numeric : 'unsupported';
}

const UNNOTABLE_BLOCKS = [ 'core/template-part', 'core/block', 'core/freeform' ];

/** Why a block cannot take a note, or `null` when it can. */
export function noteBlockRefusal( block: {
	name?: string;
	editingMode?: string;
	hasReusableParent: boolean;
} ): string | null {
	if (
		block.editingMode === 'disabled' ||
		block.hasReusableParent ||
		UNNOTABLE_BLOCKS.includes( block.name ?? '' )
	) {
		return 'Notes can only go on blocks that belong to the open post, not on template parts, synced patterns or classic blocks. Pick another block.';
	}

	return null;
}
