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

export function getNoteExcerpt( note: Note ): string | null {
	return note.subject.length > 1 ? note.subject[ 1 ].text : null;
}

const capitalize = ( value: string ) => value.charAt( 0 ).toUpperCase() + value.slice( 1 );

// Client-side type filter over the loaded notes; options come from the types
// actually present. Never wired to the engine's server filter.
export function buildTypeField( types: string[] ): Field< Note > {
	return {
		id: 'type',
		label: __( 'Type' ),
		getValue: ( { item } ) => item.type,
		elements: types.map( ( type ) => ( {
			value: type,
			label: capitalize( type.replace( /_/g, ' ' ) ),
		} ) ),
		filterBy: {
			operators: [ 'isAny' ],
		},
		enableSorting: false,
	};
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
			render: ( { item } ) => getNoteExcerpt( item ),
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
