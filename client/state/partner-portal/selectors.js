import getCurrentRoute from 'calypso/state/selectors/get-current-route';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export const isPartnerPortal = ( state ) =>
	( getCurrentRoute( state ) ?? '' ).startsWith( '/partner-portal' );
