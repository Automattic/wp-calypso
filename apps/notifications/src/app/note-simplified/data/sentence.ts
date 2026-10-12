import { splitSubject } from '../../note-list/simplified-subject';
import { getDisplayUrl } from './text';
import type { Note, Subject } from '../../types';

export type Item = { title: string; url?: string };

const ITEM_RANGE_TYPES = [ 'post', 'comment', 'site' ];

const getItemRange = ( note: Note ) =>
	note.subject[ 0 ]?.ranges?.find( ( { type, url } ) => url && ITEM_RANGE_TYPES.includes( type ) );

/** What happened, without the thing it happened to when the two can be told apart. */
export function getWhatHappened( note: Note ): Subject {
	const [ sentence ] = note.subject;
	const action = splitSubject( sentence )?.action ?? sentence;
	return {
		...action,
		// Reply notes lead with an inline icon that only makes sense in the list.
		ranges: action?.ranges?.filter( ( { type } ) => type !== 'noticon' ),
	};
}

/** The thing it happened to, which ends the sentence. */
export function getItem( note: Note ): Item | undefined {
	const split = splitSubject( note.subject[ 0 ] );
	return split ? { title: split.title, url: getItemRange( note )?.url } : undefined;
}

/** Where it happened, unless the sentence already names the site. */
export function getSiteHost( note: Note ) {
	const isSiteNamed = note.subject[ 0 ]?.ranges?.some( ( { type } ) => type === 'site' );
	return isSiteNamed ? undefined : getDisplayUrl( getItemRange( note )?.url );
}
