/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import GoogleMyBusinessSelectBusinessType from './select-business-type';
import ConnectToGoogle from './connect-to-google';
import SearchForALocation from './search-for-a-location';
import ShowListOfLocations from './show-list-of-locations';
import Success from './success';
import Create from './create';
import Verify from './verify';

export function selectBusinessType( context, next ) {
	const { params } = context;
	context.primary = <GoogleMyBusinessSelectBusinessType siteId={ params.site_id } />;
	next();
}

export function connectToGoogle( context, next ) {
	const { params } = context;
	context.primary = <ConnectToGoogle siteId={ params.site_id } />;
	next();
}

export function showListOfLocations( context, next ) {
	const { params } = context;
	context.primary = <ShowListOfLocations siteId={ params.site_id } />;
	next();
}

export function searchForALocation( context, next ) {
	const { params } = context;
	context.primary = <SearchForALocation siteId={ params.site_id } />;
	next();
}

export function success( context, next ) {
	const { params } = context;
	context.primary = <Success siteId={ params.site_id } />;
	next();
}

export function create( context, next ) {
	const { params } = context;
	context.primary = <Create siteId={ params.site_id } />;
	next();
}

export function verify( context, next ) {
	const { params } = context;
	context.primary = <Verify siteId={ params.site_id } />;
	next();
}
