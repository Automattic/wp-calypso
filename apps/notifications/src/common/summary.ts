import type { Note, Subject } from './types';

export function getNoteTitle( note: Note ): string {
	return note.subject[ 0 ]?.text ?? note.title;
}

export function getNoteExcerpt( note: Note ): string | null {
	return note.subject.length > 1 ? note.subject[ 1 ].text : null;
}

// The actor who triggered the note: the header's leading user range (how the
// legacy panel identifies the sender), falling back to the body's user block.
export function getNoteSender( note: Note ): string | null {
	const header = note.header?.[ 0 ];
	if ( header?.ranges?.[ 0 ]?.type === 'user' && header.text ) {
		return header.text;
	}
	return note.body?.find( ( block ) => block.type === 'user' )?.text ?? null;
}

// Resolve the link used to wrap the header avatar / subject text. A user range
// whose id differs from the site id links to the Reader profile (some site
// notifications populate id with the siteId); anything else falls back to the
// range's own url. Mirrors the legacy `SummaryInSingle` behaviour.
export function getHeaderLink( block: Subject ): string | undefined {
	const range = block.ranges?.[ 0 ];
	if ( ! range ) {
		return undefined;
	}
	if ( range.type === 'user' && range.id && range.id !== range.site_id ) {
		return `https://wordpress.com/reader/users/id/${ range.id }`;
	}
	return range.url;
}
