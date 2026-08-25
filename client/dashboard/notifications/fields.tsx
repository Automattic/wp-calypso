import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import type { Note } from './engine';
import type { Field } from '@wordpress/dataviews';

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

const groupTitles = [
	__( 'Today' ),
	__( 'Yesterday' ),
	__( 'Older than 2 days' ),
	__( 'Older than a week' ),
	__( 'Older than a month' ),
];

// Map a note's timestamp to its time-group index (0 = Today … 4 = Older than a month).
const getTimeGroupKey = ( timestamp: string ): number => {
	const now = new Date().setHours( 0, 0, 0, 0 );
	const timeBoundaries = [
		Infinity,
		now,
		new Date( now - DAY_MILLISECONDS ),
		new Date( now - DAY_MILLISECONDS * 6 ),
		new Date( now - DAY_MILLISECONDS * 30 ),
		-Infinity,
	];

	const timeGroups = timeBoundaries
		.slice( 0, -1 )
		.map( ( val, index ) => [ val, timeBoundaries[ index + 1 ] ] );

	const time = new Date( timestamp );
	return timeGroups.findIndex( ( [ after, before ] ) => before < time && time <= after );
};

export function getNoteTitle( note: Note ): string {
	return note.subject[ 0 ]?.text ?? note.title;
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

export function getNoteExcerpt( note: Note ): string | null {
	return note.subject.length > 1 ? note.subject[ 1 ].text : null;
}

export type NoteBlock = Note[ 'body' ][ number ];

export type NoteBodyParts = {
	/** Muted context blocks (post title, prompt text, likers on non-comment notes). */
	context: NoteBlock[];
	/** The quoted comment block, when the note carries one. */
	comment: NoteBlock | null;
};

export type BlockSegment = { text: string; url?: string };

/**
 * Split a block's text into plain and linked segments using its `ranges`
 * (substring offsets from the API). Overlapping or nested ranges keep the
 * first; ranges without a URL don't affect the text.
 */
export function getBlockSegments( block: NoteBlock ): BlockSegment[] {
	const linkRanges = ( block.ranges ?? [] )
		.filter( ( range ) => !! range.url && range.indices[ 1 ] > range.indices[ 0 ] )
		.sort( ( a, b ) => a.indices[ 0 ] - b.indices[ 0 ] );

	const segments: BlockSegment[] = [];
	let cursor = 0;
	for ( const range of linkRanges ) {
		const [ start, end ] = range.indices;
		if ( start < cursor || end > block.text.length ) {
			continue;
		}
		if ( start > cursor ) {
			segments.push( { text: block.text.slice( cursor, start ) } );
		}
		segments.push( { text: block.text.slice( start, end ), url: range.url } );
		cursor = end;
	}
	if ( cursor < block.text.length ) {
		segments.push( { text: block.text.slice( cursor ) } );
	}
	return segments;
}

/**
 * Split the note's body blocks for display: the comment block becomes quoted
 * content; the rest are context lines. On comment notes the user blocks are
 * dropped (the header already names the sender), while on other note types
 * they are real content (who liked/followed).
 */
export function getNoteBodyParts( note: Note ): NoteBodyParts {
	const blocks = ( note.body ?? [] ).filter( ( block ) => block.text && block.text.trim() );
	const commentBlock = blocks.find( ( block ) => block.type === 'comment' );
	const context = blocks
		.filter( ( block ) => block !== commentBlock )
		.filter( ( block ) => ! ( commentBlock && block.type === 'user' ) );

	return { context, comment: commentBlock ?? null };
}

export function getFields(): Field< Note >[] {
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
			render: ( { item } ) => (
				<span className="dashboard-notifications-inbox__avatar">
					<img src={ item.icon } alt="" width={ 32 } height={ 32 } />
					{ ! item.read && (
						<span className="dashboard-notifications-inbox__unread-dot" aria-hidden="true" />
					) }
				</span>
			),
		},
		{
			id: 'title',
			label: __( 'Title' ),
			enableGlobalSearch: true,
			getValue: ( { item } ) => getNoteTitle( item ),
			render: ( { item } ) => (
				<span
					className={ clsx( 'dashboard-notifications-inbox__title', {
						'is-unread': ! item.read,
					} ) }
				>
					{ getNoteTitle( item ) }
				</span>
			),
		},
		{
			id: 'description',
			label: __( 'Excerpt' ),
			enableGlobalSearch: true,
			getValue: ( { item } ) => getNoteExcerpt( item ) ?? '',
			render: ( { item } ) => getNoteExcerpt( item ),
		},
		{
			// Search-only field so typing a person's name narrows the list; never
			// added to the view's `fields`, so it doesn't render as a column.
			id: 'sender',
			label: __( 'Sender' ),
			enableGlobalSearch: true,
			enableSorting: false,
			getValue: ( { item } ) => getNoteSender( item ) ?? '',
		},
		{
			// Group-only field for the time-section headers; never added to the
			// view's `fields`, so it only renders as a header. `enableSorting: false`
			// keeps notes in their newest-first arrival order.
			id: 'timeGroup',
			label: __( 'Date' ),
			enableSorting: false,
			getValue: ( { item } ) => groupTitles[ getTimeGroupKey( item.timestamp ) ],
		},
	];
}
