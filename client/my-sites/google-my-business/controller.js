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
import Stats from './google-my-business-stats';
import Address from './google-my-business-address';
import Category from './google-my-business-category';
import Connections from './google-my-business-connections';
import Confirm from './google-my-business-confirm';
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

export function searchForALocation( context, next ) {
	const { params } = context;
	context.primary = (
		<GoogleMyBusinessCreate>
			<SearchForALocation siteId={ params.site_id } />
		</GoogleMyBusinessCreate>
	);
	next();
}

export function stats( context, next ) {
	const { params } = context;
	context.primary = <Stats siteId={ params.site_id } />;
	next();
}

export function address( context, next ) {
	const { params } = context;
	context.primary = (
		<GoogleMyBusinessCreate>
			<Address siteId={ params.site_id } />
		</GoogleMyBusinessCreate>
	);
	next();
}

export function category( context, next ) {
	const { params } = context;
	context.primary = (
		<GoogleMyBusinessCreate>
			<Category siteId={ params.site_id } />
		</GoogleMyBusinessCreate>
	);
	next();
}

export function connections( context, next ) {
	const { params } = context;
	context.primary = (
		<GoogleMyBusinessCreate>
			<Connections siteId={ params.site_id } />
		</GoogleMyBusinessCreate>
	);
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

export function confirm( context, next ) {
	const { params } = context;
	context.primary = (
		<GoogleMyBusinessCreate>
			<Confirm siteId={ params.site_id } />
		</GoogleMyBusinessCreate>
	);
	next();
}

export function create( context, next ) {
	const { params } = context;
	const path = params.path;
	let component;
	if ( path === 'confirm' ) {
		component = <Confirm key={ path } siteId={ params.site_id } />;
	}

	if ( path === 'connections' ) {
		component = <Connections key={ path } siteId={ params.site_id } />;
	}

	if ( path === 'category' ) {
		component = <Category key={ path } siteId={ params.site_id } />;
	}

	if ( path === 'address' ) {
		component = <Address key={ path } siteId={ params.site_id } />;
	}

	if ( path === 'search' ) {
		component = <SearchForALocation key={ path } siteId={ params.site_id } />;
	}

	context.primary = <GoogleMyBusinessCreate>{ component }</GoogleMyBusinessCreate>;
	next();
}
