/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import GoogleMyBusinessSelectBusinessType from './select-business-type';
import ShowListOfLocations from './show-list-of-locations';
import Stats from './google-my-business-stats';
import Verify from './google-my-business-verify';
import New from './google-my-business-new';
import GoogleMyBusinessCreate from './google-my-business-create';

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

export function stats( context, next ) {
	const { params } = context;
	context.primary = <Stats siteId={ params.site_id } />;
	next();
}

export function verify( context, next ) {
	const { params } = context;
	context.primary = <Verify siteId={ params.site_id } />;
	next();
}

export function newGMB( context, next ) {
	const { params } = context;
	context.primary = <New siteId={ params.site_id } />;
	next();
}

export function create( context, next ) {
	const { params } = context;
	context.primary = <GoogleMyBusinessCreate path={ params.path } siteId={ params.site_id } />;
	next();
}
