/** @format */
/**
 * External dependencies
 */
import { get, mapKeys, mapValues, omit } from 'lodash';

export const filterStateToQuery = filter =>
	omit(
		mapValues(
			mapKeys( filter, ( value, key ) =>
				get(
					{
						activityId: 'activity-id',
						notActivityId: 'not-activity-id',
						actor: 'by',
						notActor: 'not-by',
						group: 'group',
						notGroup: 'not-group',
						isRewindable: 'rewindable',
						object: 'object',
						notObject: 'not-object',
						page: value > 1 ? 'page' : undefined,
						startingAfter: 'start',
						startingBefore: 'end',
						textSearch: 's',
						type: 'type',
						notType: 'not-type',
					},
					key,
					undefined
				)
			),
			( value, key ) => {
				switch ( key ) {
					case 'startingAfter':
					case 'startingBefore':
						return value.toISOString();

					default:
						return value;
				}
			}
		),
		[ 'undefined' ]
	);

export const queryToFilterState = query => {
	const appendToBasList = ( base, prop, value ) => ( {
		...base,
		[ prop ]: [ ...( base[ prop ] || [] ), value ],
	} );

	return Object.keys( query ).reduce( ( filter, key ) => {
		const appendToList = prop => appendToBasList( filter, prop, filter[ key ] );
		const value = query[ key ];

		switch ( key ) {
			case 'activity-id':
			case 'activity-id[]':
				return appendToList( 'activityId' );

			case 'not-activity-id':
			case 'not-activity-id[]':
				return appendToList( 'notActivityId' );

			case 'by':
			case 'by[]':
				return appendToList( 'actor' );

			case 'not-by':
			case 'not-by[]':
				return appendToList( 'notActor' );

			case 'end':
				return { ...filter, startingBefore: Date.parse( value ) };

			case 'group':
			case 'group[]':
				return appendToList( 'group' );

			case 'not-group':
			case 'not-group[]':
				return appendToList( 'notGroup' );

			case 'object':
			case 'object[]':
				return appendToList( 'object' );

			case 'not-object':
			case 'not-object[]':
				return appendToList( 'notObject' );

			case 'page':
				return { ...filter, page: value };

			case 'rewindable':
				return { ...filter, isRewindable: !! value };

			case 'not-rewindable':
				return { ...filter, isRewindable: ! value };

			case 's':
			case 's[]':
				return appendToList( 'textSearch' );

			case 'start':
				return { ...filter, startingAfter: Date.parse( value ) };

			case 'type':
			case 'type[]':
				return appendToList( 'type' );

			case 'not-type':
			case 'not-type[]':
				return appendToList( 'notType' );

			default:
				return filter;
		}
	}, {} );
};
