/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export const isPartnerPortal = ( state ) =>
	startsWith( getCurrentRoute( state ), '/partner-portal' );
