/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	fetchSiteSettings,
	replaceSiteSettings,
	updateSiteSettings,
} from '../';

describe( '#replaceSiteSettings', () => {
	let dispatch;

	beforeEach( () => dispatch = spy() );

	it( 'should dispatch action to add received settings into state', () => {
		const settings = {
			a: 1,
		};
		replaceSiteSettings( { dispatch }, { siteId: 123456 }, null, { settings } );
		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch.firstCall ).to.have.been.calledWithMatch( {
			type: 'SITE_SETTINGS_RECEIVE',
			siteId: 123456,
			settings,
		} );
	} );
} );

describe( '#fetchSiteSettings', () => {
	let dispatch;

	beforeEach( () => dispatch = spy() );

	it( 'should dispatch HTTP request for site settings', () => {
		fetchSiteSettings( { dispatch }, { siteId: 123456 } );

		expect( dispatch ).to.have.been.calledWithMatch( {
			type: 'WPCOM_HTTP_REQUEST',
			path: '/sites/123456/settings',
		} );
	} );
} );

describe( '#updateSiteSettings', () => {
	let dispatch;
	const updated = {
		a: 1,
	};

	beforeEach( () => dispatch = spy() );

	it( 'should dispatch action to update state with updated settings', () => {
		updateSiteSettings( { dispatch }, { siteId: 123456 }, null, { updated } );
		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch.firstCall ).to.have.been.calledWith( {
			type: 'SITE_SETTINGS_UPDATE',
			siteId: 123456,
			settings: updated,
		} );
	} );
} );

describe( '#saveSiteSettings', () => {
	let dispatch;

	beforeEach( () => dispatch = spy() );

	it( 'should dispatch HTTP request for site settings', () => {
		fetchSiteSettings( { dispatch }, { siteId: 123456 } );

		expect( dispatch ).to.have.been.calledWithMatch( {
			type: 'WPCOM_HTTP_REQUEST',
			path: '/sites/123456/settings',
		} );
	} );
} );
