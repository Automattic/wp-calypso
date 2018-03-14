/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import GoogleMyBusinessSelectBusinessType from './select-business-type';
import SearchForALocation from './search-for-a-location';
import ShowListOfLocations from './show-list-of-locations';
import Create from './create';
import Stats from './google-my-business-stats';
import Address from './google-my-business-address';
import Category from './google-my-business-category';
import Connections from './google-my-business-connections';
import Verify from './google-my-business-verify';

export function selectBusinessType( context, next ) {
	const { params } = context;
	context.primary = <GoogleMyBusinessSelectBusinessType siteId={ params.site_id } />;
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

export function create( context, next ) {
	const { params } = context;
	context.primary = <Create siteId={ params.site_id } />;
	next();
}

export function stats( context, next ) {
	const { params } = context;
	context.primary = <Stats siteId={ params.site_id } />;
	next();
}

export function address( context, next ) {
	const { params } = context;
	context.primary = <Address siteId={ params.site_id } />;
	next();
}

export function category( context, next ) {
	const { params } = context;
	context.primary = <Category siteId={ params.site_id } />;
	next();
}

export function connections( context, next ) {
	const { params } = context;
	context.primary = <Connections siteId={ params.site_id } />;
	next();
}

export function verify( context, next ) {
	const { params } = context;
	context.primary = <Verify siteId={ params.site_id } />;
	next();
}
