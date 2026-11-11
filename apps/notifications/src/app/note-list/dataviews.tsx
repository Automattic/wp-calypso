import { __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	atSymbol,
	cart,
	chartBar,
	caution,
	check,
	comment,
	info,
	lockOutline,
	plus,
	thumbsUp,
	update,
} from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { html } from '../../panel/indices-to-html';
import getIsNotePendingApproval from '../../panel/state/selectors/get-is-note-pending-approval';
import getIsNoteRead from '../../panel/state/selectors/get-is-note-read';
import NoteIcon from '../note-icon';
import trophyGridicon from '../note-icon/trophy-gridicon';
import { getNotePreview } from '../note-simplified';
import type { LayoutStyle, Note, Range, Subject } from '../types';
import type { Field } from '@wordpress/dataviews';
import type { JSX } from 'react';
import './dataviews-overrides.scss';

const iconMap: { [ key in string ]: JSX.Element } = {
	'\uf814': atSymbol,
	'\uf300': comment,
	'\uf801': plus,
	'\uf455': info,
	'\uf470': lockOutline,
	'\uf806': chartBar, // stats
	'\uf805': update, // reblog
	'\uf408': thumbsUp, // star
	'\uf804': trophyGridicon, // trophy
	'\uf467': comment, // reply
	'\uf414': caution, // warning
	'\uf418': check,
	'\uf447': cart,
};

const REPLY_NOTICON = '\uf467';

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

const simplify = (
	item: Note,
	layoutStyle: LayoutStyle
): { action: Subject; preview?: string } | null => {
	const summary = item.meta?.summary;

	if ( layoutStyle !== 'simplified' || ! summary ) {
		return null;
	}

	const replyId = item.meta?.ids?.reply_comment;
	// The summary leaves out the reply icon the subject shows when you've replied,
	// so add it back as a zero-width noticon range at the start of the text.
	const replyIconRanges: Range[] = replyId
		? [ { type: 'noticon', value: REPLY_NOTICON, indices: [ 0, 0 ], id: replyId, parent: null } ]
		: [];

	return {
		action: { ...summary, ranges: [ ...replyIconRanges, ...( summary.ranges ?? [] ) ] },
		preview: getNotePreview( item ),
	};
};

export const SelectedNoteIdContext = createContext< string | undefined >( undefined );

// Row state is read here rather than from the item: DataViews keeps its own copy of
// rendered rows and only refreshes those in the current window.
const useIsUnapproved = ( note: Note ) =>
	useSelector( ( state ) => getIsNotePendingApproval( state, note ) );

const NoteBadge = ( { note }: { note: Note } ) => {
	const isRead = useSelector( ( state ) => getIsNoteRead( state, note ) );
	const isUnapproved = useIsUnapproved( note );

	return (
		<span
			className={ clsx( 'wpnc__gridicon', {
				'is-unread': ! isRead,
				'is-unapproved': isUnapproved,
			} ) }
		>
			<Icon icon={ iconMap[ note.noticon ] ?? info } size={ 14 } />
		</span>
	);
};

const NoteSubject = ( { note, subject }: { note: Note; subject: string } ) => {
	const isActive = useContext( SelectedNoteIdContext ) === note.id.toString();
	const isUnapproved = useIsUnapproved( note );

	return (
		<HStack alignment="topLeft">
			<div
				className={ clsx( 'wpnc__subject', {
					// Marks the open note's row for the active highlight (see CSS).
					'is-active': isActive,
				} ) }
				/* eslint-disable-next-line react/no-danger */
				dangerouslySetInnerHTML={ { __html: subject } }
			/>
			{ isUnapproved && (
				<Badge className="wpnc__pending-badge" intent="medium">
					{ __( 'Pending' ) }
				</Badge>
			) }
		</HStack>
	);
};

export function getFields( layoutStyle: LayoutStyle = 'detailed' ): Field< Note >[] {
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
			render: ( { item } ) => (
				<NoteIcon icon={ item.icon } size={ 36 } badge={ <NoteBadge note={ item } /> } />
			),
		},
		{
			id: 'title',
			label: __( 'Title' ),
			getValue: ( { item } ) =>
				html( simplify( item, layoutStyle )?.action ?? item.subject[ 0 ], {
					links: false,
				} ),
			render: ( { field, item } ) => (
				<NoteSubject note={ item } subject={ field.getValue( { item } ) } />
			),
		},
		{
			id: 'description',
			label: __( 'Description' ),
			render: ( { item } ) => {
				const simplified = simplify( item, layoutStyle );

				if ( simplified ) {
					return simplified.preview ? (
						<div className="wpnc__excerpt">{ simplified.preview }</div>
					) : null;
				}

				return item.subject.length > 1 ? (
					<div className="wpnc__excerpt">{ item.subject[ 1 ].text }</div>
				) : null;
			},
		},
		{
			// Group-only field for the time-section headers; never added to the
			// view's `fields`, so it only renders as a header. `enableSorting: false`
			// keeps notes in their newest-first arrival order rather than sorting by
			// this label, which would order the groups alphabetically.
			id: 'timeGroup',
			label: __( 'Date' ),
			enableSorting: false,
			getValue: ( { item } ) => groupTitles[ getTimeGroupKey( item.timestamp ) ],
		},
	];
}
