import { getHeaderLink } from '../../templates/note-summary';
import { getPeople, hasComment } from './blocks';
import { getDisplayUrl, getRangeText } from './text';
import type { Note } from '../../types';

export type Follow = { siteId: number; isFollowing: boolean };

export type Commenter = { name?: string; url?: string; avatar?: string };

const MAX_AVATARS = 3;

/** Whether the note can say who or what did it. Orders, achievements and renewals can't. */
export const hasHeadline = ( note: Note ) => getPeople( note ).length > 0 || !! note.header?.[ 0 ];

/** A single person is named by the headline or the thread, so their block isn't repeated. */
export const hasSinglePerson = ( note: Note ) => getPeople( note ).length === 1;

/** The people who acted when there are several, otherwise the note's own icon. */
export function getAvatars( note: Note ): string[] {
	const avatars = getPeople( note )
		.map( ( { media } ) => media?.[ 0 ]?.url )
		.filter( ( url ): url is string => !! url )
		.slice( 0, MAX_AVATARS );
	return avatars.length > 1 ? avatars : [ note.icon ];
}

/** A single person's site can be followed from the line that names them. */
export function getFollow( note: Note ): Follow | undefined {
	const [ person ] = getPeople( note );
	const siteId = person?.meta?.ids?.site;
	if ( ! hasSinglePerson( note ) || hasComment( note ) || ! siteId ) {
		return undefined;
	}
	return person.actions && 'follow' in person.actions
		? { siteId, isFollowing: !! person.actions.follow }
		: undefined;
}

/** Whoever wrote the comment the note is for. */
export function getCommenter( note: Note ): Commenter {
	const [ person ] = getPeople( note );
	const [ sentence ] = note.subject;
	return {
		name: person?.text ?? getRangeText( sentence, 'user' ),
		url: person?.meta?.ids?.user
			? `https://wordpress.com/reader/users/id/${ person.meta.ids.user }`
			: ( person?.meta?.links?.home ?? getHeaderLink( sentence ) ),
		avatar: person?.media?.[ 0 ]?.url ?? note.icon,
	};
}

/** Who is asking, shown while their comment still awaits approval. */
export const getPersonSite = ( note: Note ) =>
	getDisplayUrl( getPeople( note )[ 0 ]?.meta?.links?.home, true );
