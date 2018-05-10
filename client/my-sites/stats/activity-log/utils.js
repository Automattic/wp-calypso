/** @format */
/**
 * External dependencies
 */
import { moment as momentLib } from 'i18n-calypso';

/**
 * @typedef OffsetParams
 * @property {?string} timezone  Timezone representation to apply.
 * @property {?string} gmtOffset Offset to apply if timezone isn't supplied.
 * @property {object}  moment    Moment object to which timezone or offset will be applied.
 */

/**
 * Accepts nullable timezone and offset and applies one to the provided moment, preferring the
 * timezone. If neither are provided, return the moment unchanged.
 *
 * @param  {OffsetParams} params Parameters
 * @return {Object}       Moment with timezone applied if provided.
 *                        Moment with gmtOffset applied if no timezone is provided.
 *                        If neither is provided, the original moment is returned.
 */
export function adjustMoment( { timezone, gmtOffset, moment } ) {
	if ( timezone ) {
		return moment.tz( timezone );
	}
	if ( gmtOffset ) {
		return moment.utcOffset( gmtOffset );
	}
	return moment;
}

/**
 * Accepts an object which contains a string date representation and optionally timezone or offset.
 * Returns a moment object which is the result of parsing the string adjusted for the timezone
 * or offset, in that order and if provided.
 *
 * @param  {string}  _.startDate Date string representing start of the month (YYYY-MM-DD).
 * @param  {?string} _.timezone  Timezone representation to apply.
 * @param  {?string} _.gmtOffset Offset to apply if timezone isn't supplied.
 * @return {Object}              Start of period moment, adjusted according to timezone or gmtOffset if provided.
 */
export function getStartMoment( { gmtOffset, startDate, timezone } ) {
	if ( timezone ) {
		if ( ! startDate ) {
			return momentLib().tz( timezone );
		}

		return momentLib.tz( startDate, timezone );
	}

	if ( null !== gmtOffset ) {
		return momentLib
			.utc( startDate )
			.subtract( gmtOffset, 'hours' )
			.utcOffset( gmtOffset );
	}

	return momentLib.utc( startDate );
}

/**
 * Accepts an object which contains a string date representation and optionally timezone or offset.
 * Returns an object which is Activity Log query based on the inputs.
 *
 * @param  {string}  _.startDate Date string representing start of the month (YYYY-MM-DD).
 * @param  {?string} _.timezone  Timezone representation to apply.
 * @param  {?string} _.gmtOffset Offset to apply if timezone isn't supplied.
 * @return {Object}              Start of period moment, adjusted according to timezone or gmtOffset if provided.
 */
export function getActivityLogQuery() {
	return {
		number: 1000,
	};
}

export const filterStateToQuery = filter => {
	return Object.keys( filter )
		.map( key => {
			const spread = ( name, values = filter[ key ] ) =>
				values.length > 1 ? values.map( v => [ `${ name }[]`, v ] ) : [ [ name, values[ 0 ] ] ];

			const value = filter[ key ];

			switch ( key ) {
				case 'activityId':
					return spread( 'activity-id' );

				case 'notActivityId':
					return spread( 'not-activity-id' );

				case 'actor':
					return spread( 'by' );

				case 'notActor':
					return spread( 'not-by' );

				case 'group':
					return spread( 'group' );

				case 'notGroup':
					return spread( 'not-group' );

				case 'isRewindable':
					return [ [ 'rewindable', value ] ];

				case 'object':
					return spread( 'object' );

				case 'notObject':
					return spread( 'not-object' );

				case 'page':
					return [ [ 'page', value ] ];

				case 'startingAfter':
					return [ [ 'start', value.toISOString() ] ];

				case 'startingBefore':
					return [ [ 'end', value.toISOString() ] ];

				case 'textSearch':
					return spread( 's' );

				case 'type':
					return spread( 'type' );

				case 'notType':
					return spread( 'not-type' );

				default:
					return [];
			}
		} )
		.reduce( ( query, pairs ) => [ ...query, ...pairs ], [] );
};

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
