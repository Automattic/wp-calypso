import type { Note } from '../../types';

export type HeaderCard = { title: string; description?: string; icon?: string; url?: string };

/**
 * Without a post, the header is the next best description of the thing. When it opens
 * with a person, the thing is its second line; otherwise it is the header itself, such
 * as a site and its tagline.
 */
export function getHeaderCard( note: Note ): HeaderCard | undefined {
	const [ header, context ] = note.header ?? [];
	if ( ! header?.text ) {
		return undefined;
	}

	const [ range ] = header.ranges ?? [];
	const contextText = context?.text?.trim();
	if ( range?.type !== 'user' || range.id === range.site_id ) {
		return {
			title: header.text,
			description: contextText,
			icon: header.media?.[ 0 ]?.url,
			url: range?.url,
		};
	}
	return contextText
		? { title: contextText, url: context.ranges?.[ 0 ]?.url ?? note.url }
		: undefined;
}
