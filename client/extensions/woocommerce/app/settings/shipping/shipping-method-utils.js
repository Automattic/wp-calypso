/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FlatRate from './shipping-methods/flat-rate';
import FreeShipping from './shipping-methods/free-shipping';
import LocalPickup from './shipping-methods/local-pickup';

export const getMethodName = ( method, translate ) => {
	switch ( method.methodType ) {
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

export const getMethodSummary = ( method, translate ) => {
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

export const renderMethodSettingsView = ( methodType, methodId, siteId, methodSettings ) => {
	switch ( methodType ) {
		case 'flat_rate':
			return <FlatRate id={ methodId } siteId={ siteId } { ...methodSettings } />;
		case 'free_shipping':
			return <FreeShipping id={ methodId } siteId={ siteId } { ...methodSettings } />;
		case 'local_pickup':
			return <LocalPickup id={ methodId } siteId={ siteId } { ...methodSettings } />;
		default:
			return null;
	}
};
