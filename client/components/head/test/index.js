/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { HeadBase } from '../';

describe( 'Head', function() {
	context( 'with environment set to production', function() {
		const wrapper = shallow( <HeadBase env="production" /> );

		it( 'should return the correct favicon URL for the relevant <link> tags', function() {
			const faviconUrl = '//s1.wp.com/i/favicon.ico';
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
		} );
	} );

	context( 'with environment set to stage', function() {
		const wrapper = shallow( <HeadBase env="stage" /> );

		it( 'should return the correct favicon URL for the relevant <link> tags', function() {
			const faviconUrl = '/calypso/images/favicons/favicon-staging.ico';
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
		} );
	} );

	context( 'with environment set to horizon', function() {
		const wrapper = shallow( <HeadBase env="horizon" /> );

		it( 'should return the correct favicon URL for the relevant <link> tags', function() {
			const faviconUrl = '/calypso/images/favicons/favicon-horizon.ico';
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
		} );
	} );

	context( 'with environment set to wpcalypso', function() {
		const wrapper = shallow( <HeadBase env="wpcalypso" /> );

		it( 'should return the correct favicon URL for the relevant <link> tags', function() {
			const faviconUrl = '/calypso/images/favicons/favicon-wpcalypso.ico';
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
		} );
	} );

	context( 'with environment set to development', function() {
		const wrapper = shallow( <HeadBase env="development" /> );

		it( 'should return the correct favicon URL for the relevant <link> tags', function() {
			const faviconUrl = '/calypso/images/favicons/favicon-development.ico';
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'shortcut icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
			expect( wrapper.find( { rel: 'icon', type: 'image/x-icon' } ).prop( 'href' ) ).to.equal( faviconUrl );
		} );
	} );
} );
