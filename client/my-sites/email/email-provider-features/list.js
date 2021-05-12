/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

const getEmailForwardingFeatures = () => {
	return [ translate( 'No billing' ), translate( 'Receive emails sent to your custom domain' ) ];
};

const getGoogleFeatures = () => {
	return [
		translate( 'Annual billing' ),
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( 'Video calls, docs, spreadsheets, and more' ),
		translate( 'Work from anywhere on any device – even offline' ),
	];
};

const getTitanFeatures = () => {
	return [
		translate( 'Monthly billing' ),
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( 'One-click import of existing emails and contacts' ),
	];
};

export { getEmailForwardingFeatures, getGoogleFeatures, getTitanFeatures };
