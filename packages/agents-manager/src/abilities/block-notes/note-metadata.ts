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

	if ( typeof raw === 'string' ) {
		return raw.trim();
	}

	if ( typeof rendered !== 'string' ) {
		return '';
	}

	const doc = new DOMParser().parseFromString( rendered, 'text/html' );

	return ( doc.body.textContent ?? '' ).trim();
}
