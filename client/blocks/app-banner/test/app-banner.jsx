/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
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
		expect( wrapper.instance().getiOSDeepLink( '/post', EDITOR ) ).toBe(
			'https://apps.wordpress.com/get#%2Fpost'
		);
		expect( wrapper.instance().getiOSDeepLink( '/post/discover.wordpress.com', EDITOR ) ).toBe(
			'https://apps.wordpress.com/get#%2Fpost'
		);
		expect( wrapper.instance().getiOSDeepLink( null, EDITOR ) ).toBe(
			'https://apps.wordpress.com/get#%2Fpost'
		);
	} );

	test( 'iOS deep links return correct URIs for NOTES', () => {
		expect( wrapper.instance().getiOSDeepLink( '/notifications', NOTES ) ).toBe(
			'https://apps.wordpress.com/get#%2Fnotifications'
		);
		expect( wrapper.instance().getiOSDeepLink( '/notifications/12345', NOTES ) ).toBe(
			'https://apps.wordpress.com/get#%2Fnotifications'
		);
		expect( wrapper.instance().getiOSDeepLink( null, NOTES ) ).toBe(
			'https://apps.wordpress.com/get#%2Fnotifications'
		);
	} );

	test( 'iOS deep links return correct URIs for READER', () => {
		expect( wrapper.instance().getiOSDeepLink( '/', READER ) ).toBe(
			'https://apps.wordpress.com/get#%2Fread'
		);
		expect( wrapper.instance().getiOSDeepLink( '/read/feeds/12345/posts/6789', READER ) ).toBe(
			'https://apps.wordpress.com/get#%2Fread%2Ffeeds%2F12345%2Fposts%2F6789'
		);
		expect( wrapper.instance().getiOSDeepLink( null, READER ) ).toBe(
			'https://apps.wordpress.com/get#%2Fread'
		);
	} );

	test( 'iOS deep links return correct URIs for STATS', () => {
		expect( wrapper.instance().getiOSDeepLink( '/stats', STATS ) ).toBe(
			'https://apps.wordpress.com/get#%2Fstats'
		);
		expect( wrapper.instance().getiOSDeepLink( '/stats/day/discover.wordpress.com', STATS ) ).toBe(
			'https://apps.wordpress.com/get#%2Fstats%2Fday%2Fdiscover.wordpress.com'
		);
		expect( wrapper.instance().getiOSDeepLink( null, STATS ) ).toBe(
			'https://apps.wordpress.com/get#%2Fstats'
		);
	} );
} );
