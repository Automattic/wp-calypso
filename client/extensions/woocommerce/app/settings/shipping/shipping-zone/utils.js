/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FlatRate from './shipping-methods/flat-rate';
import FreeShipping from './shipping-methods/free-shipping';
import LocalPickup from './shipping-methods/local-pickup';

export const getMethodName = ( methodType ) => {
	switch ( methodType ) {
		case 'flat_rate':
			return translate( 'Flat Rate' );
		case 'free_shipping':
			return translate( 'Free Shipping' );
		case 'local_pickup':
			return translate( 'Local Pickup' );
		default:
			return translate( 'Unknown shipping method' );
	}
};

export const getMethodSummary = ( method ) => {
	switch ( method.methodType ) {
		case 'flat_rate':
			return translate( 'Cost: %s', { args: [ method.cost ] } );
		case 'free_shipping':
			if ( ! method.requires ) {
				return translate( 'For everyone' );
			}

			return translate( 'Minimum order amount: %s', { args: [ method.min_amount ] } );
		case 'local_pickup':
			return translate( 'Cost: %s', { args: [ method.cost ] } );
		default:
			return '';
	}
};

export const renderMethodSettingsView = ( method, siteId ) => {
	switch ( method.methodType ) {
		case 'flat_rate':
			return <FlatRate siteId={ siteId } { ...method } />;
		case 'free_shipping':
			return <FreeShipping siteId={ siteId } { ...method } />;
		case 'local_pickup':
			return <LocalPickup siteId={ siteId } { ...method } />;
		default:
			return null;
	}
};
