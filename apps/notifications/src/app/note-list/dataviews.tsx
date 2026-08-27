import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	chartBar,
	caution,
	check,
	comment,
	info,
	lockOutline,
	plus,
	store,
	thumbsUp,
	update,
} from '@wordpress/icons';
import clsx from 'clsx';
import { getNoticonName } from '../../common/icon-map';
import { getTimeGroupIndex } from '../../common/time-groups';
import { html } from '../../panel/indices-to-html';
import NoteIcon from '../note-icon';
import trophyGridicon from '../note-icon/trophy-gridicon';
import type { NoticonName } from '../../common/icon-map';
import type { Note } from '../types';
import type { Field } from '@wordpress/dataviews';
import type { JSX } from 'react';
import './dataviews-overrides.scss';

// This shell's visuals for the shared semantic names; reply deliberately
// renders as a comment icon here.
const iconMap: Record< NoticonName, JSX.Element > = {
	mention: comment,
	comment,
	add: plus,
	info,
	lock: lockOutline,
	stats: chartBar,
	reblog: update,
	star: thumbsUp,
	trophy: trophyGridicon,
	reply: comment,
	warning: caution,
	checkmark: check,
	cart: store,
};

const groupTitles = [
	__( 'Today' ),
	__( 'Yesterday' ),
	__( 'Older than 2 days' ),
	__( 'Older than a week' ),
	__( 'Older than a month' ),
];

export function getFields(): Field< Note >[] {
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
			render: ( { item } ) => (
				<NoteIcon
					icon={ item.icon }
					size={ 32 }
					badge={
						<span className={ clsx( 'wpnc__gridicon', { 'is-unread': ! item.read } ) }>
							<Icon icon={ iconMap[ getNoticonName( item.noticon ) ] } size={ 14 } />
						</span>
					}
				/>
			),
		},
		{
			id: 'title',
			label: __( 'Title' ),
			getValue: ( { item } ) =>
				html( item.subject[ 0 ], {
					links: false,
				} ),
			render: ( { field, item } ) => (
				<div
					className={ clsx( 'wpnc__subject', {
						// Marks the open note's row for the active highlight (see CSS).
						'is-active': ( item as Note & { isActive?: boolean } ).isActive,
					} ) }
					/* eslint-disable-next-line react/no-danger */
					dangerouslySetInnerHTML={ { __html: field.getValue( { item } ) } }
				/>
			),
		},
		{
			id: 'description',
			label: __( 'Description' ),
			render: ( { item } ) =>
				item.subject.length > 1 ? (
					<div className="wpnc__excerpt">{ item.subject[ 1 ].text }</div>
				) : null,
		},
		{
			// Group-only field for the time-section headers; never added to the
			// view's `fields`, so it only renders as a header. `enableSorting: false`
			// keeps notes in their newest-first arrival order rather than sorting by
			// this label, which would order the groups alphabetically.
			id: 'timeGroup',
			label: __( 'Date' ),
			enableSorting: false,
			getValue: ( { item } ) => groupTitles[ getTimeGroupIndex( item.timestamp ) ],
		},
	];
}
