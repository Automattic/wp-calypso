import {
	getNoteExcerpt,
	getNoteSender,
	getNoteTitle,
} from '@automattic/notifications/src/common/summary';
import { getTimeGroupIndex } from '@automattic/notifications/src/common/time-groups';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { getNoticonIcon } from './note-icons';
import type { Note } from './engine';
import type { Field } from '@wordpress/dataviews';

const groupTitles = [
	__( 'Today' ),
	__( 'Yesterday' ),
	__( 'Older than 2 days' ),
	__( 'Older than a week' ),
	__( 'Older than a month' ),
];

export function getNoteTypeLabel( note: Note ): string {
	switch ( note.type ) {
		case 'comment':
			return __( 'Comment' );
		case 'comment_like':
			return __( 'Comment like' );
		case 'like':
			return __( 'Like' );
		case 'follow':
			return __( 'New subscriber' );
		case 'post':
			return __( 'New post' );
		case 'reblog':
			return __( 'Reblog' );
		default: {
			const label = note.type.replace( /_/g, ' ' );
			return label.charAt( 0 ).toUpperCase() + label.slice( 1 );
		}
	}
}

export { getNoteExcerpt, getNoteSender, getNoteTitle };

const TITLE_BOLD_RANGE_TYPES = new Set( [ 'user', 'post', 'b' ] );

export type TitleSegment = { text: string; bold: boolean; url: string | null };

/**
 * The title split into spans, following the subject's ranges: user/post ranges
 * are bold, and any range's URL rides along so the detail pane can embed links
 * (the list renders the same segments without them).
 */
export function getTitleSegments( note: Note ): TitleSegment[] {
	const block = note.subject[ 0 ];
	if ( ! block ) {
		return [ { text: note.title, bold: false, url: null } ];
	}

	const markedRanges = ( block.ranges ?? [] )
		.filter(
			( range ) =>
				( TITLE_BOLD_RANGE_TYPES.has( range.type ) || !! range.url ) &&
				range.indices[ 1 ] > range.indices[ 0 ]
		)
		.sort( ( a, b ) => a.indices[ 0 ] - b.indices[ 0 ] );

	const segments: TitleSegment[] = [];
	let cursor = 0;
	for ( const range of markedRanges ) {
		const [ start, end ] = range.indices;
		if ( start < cursor || end > block.text.length ) {
			continue;
		}
		if ( start > cursor ) {
			segments.push( { text: block.text.slice( cursor, start ), bold: false, url: null } );
		}
		segments.push( {
			text: block.text.slice( start, end ),
			bold: TITLE_BOLD_RANGE_TYPES.has( range.type ),
			url: range.url ?? null,
		} );
		cursor = end;
	}
	if ( cursor < block.text.length ) {
		segments.push( { text: block.text.slice( cursor ), bold: false, url: null } );
	}
	return segments;
}

export type NoteBlock = Note[ 'body' ][ number ];

export type NoteBodyParts = {
	/** Muted context blocks (post title, prompt text, likers on non-comment notes). */
	context: NoteBlock[];
	/** The quoted comment block, when the note carries one. */
	comment: NoteBlock | null;
	/** Blocks the payload places after the comment (e.g. "You replied to this comment."). */
	postscript: NoteBlock[];
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

export type NoteUserRef = {
	name: string;
	avatarUrl: string | null;
	url: string | null;
	siteId: number | null;
	isFollowing: boolean;
	canFollow: boolean;
	homeTitle: string | null;
	homeUrl: string | null;
};

/** Identity bits of a body `user` block: name, avatar, links, and follow state. */
export function getNoteUserRef( block: NoteBlock ): NoteUserRef {
	const siteId = block.meta?.ids?.site ?? null;
	const homeUrl = block.meta?.links?.home ?? null;
	const homeTitle =
		block.meta?.titles?.home ??
		( homeUrl ? homeUrl.replace( /^https?:\/\//, '' ).replace( /\/$/, '' ) : null );

	return {
		name: block.text,
		avatarUrl: block.media?.find( ( media ) => media.type === 'image' )?.url ?? null,
		url: block.ranges?.find( ( range ) => range.type === 'user' && range.url )?.url ?? homeUrl,
		siteId,
		isFollowing: !! ( block.actions && 'follow' in block.actions && block.actions.follow ),
		canFollow: !! ( block.actions && siteId !== null ),
		homeTitle,
		homeUrl,
	};
}

/**
 * Split the note's body blocks for display: the comment block becomes quoted
 * content; the rest are context lines. On comment notes the user blocks are
 * dropped (the header already names the sender), while on other note types
 * they are real content (who liked/followed).
 */
export function getNoteBodyParts( note: Note ): NoteBodyParts {
	const blocks = ( note.body ?? [] ).filter( ( block ) => block.text && block.text.trim() );
	const commentIndex = blocks.findIndex( ( block ) => block.type === 'comment' );
	const commentBlock = commentIndex === -1 ? null : blocks[ commentIndex ];
	const keep = ( block: NoteBlock ) => ! ( commentBlock && block.type === 'user' );

	const context = ( commentIndex === -1 ? blocks : blocks.slice( 0, commentIndex ) ).filter( keep );
	const postscript = commentIndex === -1 ? [] : blocks.slice( commentIndex + 1 ).filter( keep );

	return { context, comment: commentBlock, postscript };
}

export function getFields(): Field< Note >[] {
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
			render: ( { item } ) => (
				<span className="dashboard-notifications-inbox__avatar">
					<img src={ item.icon } alt="" width={ 32 } height={ 32 } />
					<span className="dashboard-notifications-inbox__noticon" aria-hidden="true">
						<Icon icon={ getNoticonIcon( item.noticon ) } size={ 14 } />
					</span>
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
					{ getTitleSegments( item ).map( ( segment, index ) =>
						segment.bold ? <strong key={ index }>{ segment.text }</strong> : segment.text
					) }
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
			getValue: ( { item } ) => groupTitles[ getTimeGroupIndex( item.timestamp ) ],
		},
	];
}
