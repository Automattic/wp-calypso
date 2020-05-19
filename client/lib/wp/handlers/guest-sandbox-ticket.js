/**
 * External dependencies
 */

import { parse, stringify } from 'qs';
import store from 'store';

export const GUEST_TICKET_LOCALFORAGE_KEY = 'guest_sandbox_ticket';
export const GUEST_TICKET_VALIDITY_DURATION = 1000 * 60 * 60 * 2; // two hours

const getTicket = () => store.get( GUEST_TICKET_LOCALFORAGE_KEY );

/**
 * Deletes an old guest sandbox ticket from local storage if one exists.
 */
export const deleteOldTicket = () => {
	const existingTicket = getTicket();

	if (
		existingTicket &&
		existingTicket.createdDate < Date.now() - GUEST_TICKET_VALIDITY_DURATION
	) {
		store.remove( GUEST_TICKET_LOCALFORAGE_KEY );
	}
};

/**
 * Updates `wpcom` to pass a store sandbox ticket if one is present.
 *
 * @param {object} wpcom Original WPCOM instance
 */
export const injectGuestSandboxTicketHandler = ( wpcom ) => {
	const request = wpcom.request.bind( wpcom );

	Object.assign( wpcom, {
		request( params, callback ) {
			const ticket = getTicket();

			if ( ticket ) {
				const query = parse( params.query );

				params = Object.assign( {}, params, {
					query: stringify( Object.assign( query, { store_sandbox_ticket: ticket.value } ) ),
				} );
			}

			return request( params, callback );
		},
	} );
};

/**
 * Deletes the old ticket and sets the new one from a `guest_ticket` querystring parameter.
 */
const initialize = () => {
	if ( typeof window === 'undefined' ) {
		return;
	}

	deleteOldTicket();

	const queryObject = parse( window.location.search.replace( '?', '' ) );

	if ( queryObject.guest_ticket ) {
		store.set( GUEST_TICKET_LOCALFORAGE_KEY, {
			createdDate: Date.now(),
			value: queryObject.guest_ticket,
		} );
	}
};

initialize();
