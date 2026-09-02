import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { getAvailableNoteActions, useIsNoteApproved } from './engine';
import { getNoticonIcon, replyIcon } from './note-icons';
import {
	getNoteExcerpt,
	getNoteListMeta,
	getNoteTitle,
	getTimeGroupIndex,
	getTitleSegments,
	isReplyToUser,
} from './note-model';
import type { Note } from './engine';
import type { Field } from '@wordpress/dataviews';

const groupTitles = [
	__( 'Today' ),
	__( 'Yesterday' ),
	__( 'Older than 2 days' ),
	__( 'Older than a week' ),
	__( 'Older than a month' ),
];

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

/** DataViews fields for the inbox list. */
export function getFields( { currentUserId }: { currentUserId: number } ): Field< Note >[] {
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
			render: ( { item } ) => <NoteIcon note={ item } />,
		},
		{
			id: 'title',
			label: __( 'Title' ),
			getValue: ( { item } ) => getNoteTitle( item ),
			render: ( { item } ) => (
				<span
					className={ clsx( 'dashboard-notifications-inbox__title', {
						'is-unread': ! item.read,
					} ) }
				>
					{ isReplyToUser( item, currentUserId ) && (
						<Icon
							className="dashboard-notifications-inbox__title-icon"
							icon={ replyIcon }
							size={ 16 }
						/>
					) }
					{ getTitleSegments( item ).map( ( segment, index ) =>
						segment.bold ? <strong key={ index }>{ segment.text }</strong> : segment.text
					) }
				</span>
			),
		},
		{
			id: 'meta',
			label: __( 'Type' ),
			getValue: ( { item } ) => getNoteListMeta( item ),
			render: ( { item } ) => getNoteListMeta( item ),
		},
		{
			id: 'description',
			label: __( 'Excerpt' ),
			getValue: ( { item } ) => getNoteExcerpt( item ) ?? '',
			render: ( { item } ) => getNoteExcerpt( item ),
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
