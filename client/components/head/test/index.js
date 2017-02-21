/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import config from 'config';
import Head from '../';

describe( 'Head', function() {
	const wrapper = shallow( <Head stylesheetUrl="myStyle.css" /> );

	it( 'should return the correct favicon URL for the relevant <link> tags', function() {
		const faviconUrl = config( 'faviconUrl' );
		expect( wrapper.find( { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
		expect( wrapper.find( { rel: 'shortcut icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
		expect( wrapper.find( { rel: 'icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
	} );
} );
