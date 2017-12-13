/** @format */

/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getConciergeShifts from './get-concierge-shifts';

const NUMBER_OF_DAYS_TO_SHOW = 7;

export default state => {
	const shifts = getConciergeShifts( state );
	if ( shifts === null ) {
		return null;
	}

	// First set up an object that maps day timestamp => array of appointments
	const appointments = {};
	// Create an empty appointment array for each upcoming date
	for ( let x = 0; x < NUMBER_OF_DAYS_TO_SHOW; x++ ) {
		const startOfDay = moment()
			.startOf( 'day' )
			.add( x, 'days' )
			.valueOf();
		appointments[ startOfDay ] = [];
	}

	// Go through each shift — if the
	shifts.forEach( appointment => {
		const startOfDay = moment( appointment.beginTimestamp )
			.startOf( 'day' )
			.valueOf();
		if ( appointments.hasOwnProperty( startOfDay ) ) {
			appointments[ startOfDay ].push( appointment );
		}
	} );

	// Now that `appointments` is an object with each date timestamp pointing to an array of available
	// appointments, reformat it and send it back:
	return Object.keys( appointments )
		.sort()
		.map( startOfDay => ( {
			date: parseInt( startOfDay, 10 ),
			appointments: appointments[ startOfDay ],
		} ) );
};
