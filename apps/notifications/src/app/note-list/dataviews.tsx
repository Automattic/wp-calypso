import { Icon } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import { html } from '../../panel/indices-to-html';
import noticon2gridicon from '../../panel/utils/noticon2gridicon';
import Gridicon from '../templates/gridicons';
import NoteIcon from '../templates/note-icon';
import type { Note } from '../types';
import type { Action, Field } from '@wordpress/dataviews';
import './dataviews-overrides.scss';

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

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
				<div className="wpnc__note-icon" style={ { position: 'relative', height: '100%' } }>
					<NoteIcon icon={ item.icon } size={ 52 } />
					<span
						className="wpnc__gridicon"
						style={ {
							position: 'absolute',
							bottom: '-5px',
							right: 0,
							border: '1px solid #fff',
							background: '#ddd',
						} }
					>
						<Gridicon icon={ noticon2gridicon( item.noticon ) } size={ 16 } />
					</span>
				</div>
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
				<div className="wpnc__text-summary">
					<div
						className="wpnc__subject"
						/* eslint-disable-next-line react/no-danger */
						dangerouslySetInnerHTML={ { __html: field.getValue( { item } ) } }
					/>
				</div>
			),
		},
		{
			id: 'date',
			label: __( 'Date' ),
			getValue: ( { item } ) => item.timestamp,
			render: ( { item } ) => {
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

				const time = new Date( item.timestamp );
				const groupKey = timeGroups.findIndex(
					( [ after, before ] ) => before < time && time <= after
				);

				return <div>{ groupTitles[ groupKey ] }</div>;
			},
		},
	];
}

export function getActions( {
	onSelect,
}: {
	onSelect: ( selection: string[] ) => void;
} ): Action< Note >[] {
	return [
		{
			id: 'view',
			isPrimary: true,
			icon: <Icon icon={ isRTL() ? chevronLeft : chevronRight } />,
			label: __( 'View' ),
			callback: ( items: Note[] ) => {
				onSelect( items.map( ( item ) => item.id.toString() ) );
			},
		},
	];
}
