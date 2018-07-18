/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { AppBanner } from 'blocks/app-banner';
import { EDITOR, NOTES, READER, STATS } from 'blocks/app-banner/utils';

describe( 'AppBanner', () => {
	let wrapper;

	beforeEach( () => {
		wrapper = shallow( <AppBanner /> );
	} );

	test( 'iOS deep links return correct URIs for EDITOR', () => {
		expect( wrapper.instance().getiOSDeepLink( '/post', EDITOR ) ).equal(
			'https://apps.wordpress.com/get#%2Fpost'
		);
		expect( wrapper.instance().getiOSDeepLink( '/post/discover.wordpress.com', EDITOR ) ).equal(
			'https://apps.wordpress.com/get#%2Fpost'
		);
		expect( wrapper.instance().getiOSDeepLink( null, EDITOR ) ).equal(
			'https://apps.wordpress.com/get#%2Fpost'
		);
	} );

	test( 'iOS deep links return correct URIs for NOTES', () => {
		expect( wrapper.instance().getiOSDeepLink( '/notifications', NOTES ) ).equal(
			'https://apps.wordpress.com/get#%2Fnotifications'
		);
		expect( wrapper.instance().getiOSDeepLink( '/notifications/12345', NOTES ) ).equal(
			'https://apps.wordpress.com/get#%2Fnotifications'
		);
		expect( wrapper.instance().getiOSDeepLink( null, NOTES ) ).equal(
			'https://apps.wordpress.com/get#%2Fnotifications'
		);
	} );

	test( 'iOS deep links return correct URIs for READER', () => {
		expect( wrapper.instance().getiOSDeepLink( '/', READER ) ).equal(
			'https://apps.wordpress.com/get#%2Fread'
		);
		expect( wrapper.instance().getiOSDeepLink( '/read/feeds/12345/posts/6789', READER ) ).equal(
			'https://apps.wordpress.com/get#%2Fread%2Ffeeds%2F12345%2Fposts%2F6789'
		);
		expect( wrapper.instance().getiOSDeepLink( null, READER ) ).equal(
			'https://apps.wordpress.com/get#%2Fread'
		);
	} );

	test( 'iOS deep links return correct URIs for STATS', () => {
		expect( wrapper.instance().getiOSDeepLink( '/stats', STATS ) ).equal(
			'https://apps.wordpress.com/get#%2Fstats'
		);
		expect( wrapper.instance().getiOSDeepLink( '/stats/day/discover.wordpress.com', STATS ) ).equal(
			'https://apps.wordpress.com/get#%2Fstats%2Fday%2Fdiscover.wordpress.com'
		);
		expect( wrapper.instance().getiOSDeepLink( null, STATS ) ).equal(
			'https://apps.wordpress.com/get#%2Fstats'
		);
	} );
} );
