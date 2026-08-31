import { getNoteBodyParts as classifyNoteBody } from '@automattic/notifications/src/common/body-parts';
import { getTitleSegments } from '@automattic/notifications/src/common/segments';
import {
	getNoteExcerpt,
	getNoteSender,
	getNoteTitle,
} from '@automattic/notifications/src/common/summary';
import { getTimeGroupIndex } from '@automattic/notifications/src/common/time-groups';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { getAvailableNoteActions, useIsNoteApproved } from './engine';
import { getNoticonIcon } from './note-icons';
import type { Note } from './engine';
import type { NoteBodyParts } from '@automattic/notifications/src/common/body-parts';
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

export { getBlockSegments, getTitleSegments } from '@automattic/notifications/src/common/segments';
export type { BlockSegment, TitleSegment } from '@automattic/notifications/src/common/segments';
export { getNoteUserRef } from '@automattic/notifications/src/common/body-parts';
export type { NoteBodyParts, NoteUserRef } from '@automattic/notifications/src/common/body-parts';

export type NoteBlock = Note[ 'body' ][ number ];

/**
 * Split the note's body blocks for display: the comment block becomes quoted
 * content; the rest are context lines. On comment notes the user blocks are
 * dropped (the header already names the sender), while on other note types
 * they are real content (who liked/followed).
 */
export function getNoteBodyParts( note: Note ): NoteBodyParts {
	const { context, comment, postscript } = classifyNoteBody( note );
	if ( ! comment ) {
		return { context, comment, postscript };
	}
	const keep = ( block: NoteBlock ) => block.type !== 'user';
	return { context: context.filter( keep ), comment, postscript: postscript.filter( keep ) };
}

function NoteIcon( { note }: { note: Note } ) {
	const isApproved = useIsNoteApproved( note );
	const isUnapprovedComment =
		note.type === 'comment' && getAvailableNoteActions( note ).approveComment && ! isApproved;
	return (
		<span className="dashboard-notifications-inbox__avatar">
			<img src={ note.icon } alt="" width={ 32 } height={ 32 } />
			<span
				className={ clsx( 'dashboard-notifications-inbox__noticon', {
					'is-unread': ! note.read,
					'is-unapproved': isUnapprovedComment,
				} ) }
				aria-hidden="true"
			>
				<Icon icon={ getNoticonIcon( note.noticon ) } size={ 14 } />
			</span>
		</span>
	);
}

export function getFields(): Field< Note >[] {
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
			render: ( { item } ) => <NoteIcon note={ item } />,
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
