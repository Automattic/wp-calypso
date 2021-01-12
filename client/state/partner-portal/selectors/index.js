/**
 * Internal dependencies
 */
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

export * from 'calypso/state/partner-portal/selectors/partner';

export const isPartnerPortal = ( state ) => /^\/partner-portal(?:\/[^/]*)?/.test( getCurrentRoute( state ) );
