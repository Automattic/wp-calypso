/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

export * from 'calypso/state/partner-portal/selectors/partner';

export const isPartnerPortal = ( state ) =>
	startsWith( getCurrentRoute( state ), '/partner-portal' );
