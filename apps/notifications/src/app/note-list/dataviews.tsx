import { __experimentalHStack as HStack, Icon } from '@wordpress/components';
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
import { html } from '../../panel/indices-to-html';
import NoteIcon from '../note-icon';
import trophyGridicon from '../note-icon/trophy-gridicon';
import type { Note } from '../types';
import type { Field } from '@wordpress/dataviews';
import type { JSX } from 'react';
import './dataviews-overrides.scss';

const iconMap: { [ key in string ]: JSX.Element } = {
	'\uf814': comment, // mention
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
	'\uf447': store, // cart
};

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

const groupTitles = [
	__( 'Today' ),
	__( 'Yesterday' ),
	__( 'Older than 2 days' ),
	__( 'Older than a week' ),
	__( 'Older than a month' ),
];

const RelativeDate = ( { timestamp }: { timestamp: string } ) => {
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
	const groupKey = timeGroups.findIndex( ( [ after, before ] ) => before < time && time <= after );

	return <span>{ groupTitles[ groupKey ] }</span>;
};

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
							<Icon icon={ iconMap[ item.noticon ] ?? info } size={ 14 } />
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
					className="wpnc__subject"
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
			id: 'info',
			label: __( 'Info' ),
			render: ( { item } ) => {
				return (
					<HStack spacing={ 1 }>
						<RelativeDate timestamp={ item.timestamp } />
						<span>•</span>
						<span>{ item.title }</span>
					</HStack>
				);
			},
		},
	];
}
