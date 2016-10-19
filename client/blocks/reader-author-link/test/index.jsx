/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'ReaderAuthorLink', () => {
	let ReaderAuthorLink, author;

	useMockery( mockery => {
		mockery.registerMock( 'reader/stats', {
			recordAction: noop,
			recordGaEvent: noop,
			recordTrackForPost: noop
		} );
	} );

	before( () => {
		ReaderAuthorLink = require( '../index' );
	} );

	beforeEach( () => {
		author = { URL: 'http://wpcalypso.wordpress.com', name: 'Barnaby Blogwit' };
	} );

	it( 'should render children', () => {
		const wrapper = shallow( <ReaderAuthorLink author={ author }>Barnaby Blogwit</ReaderAuthorLink> );
		expect( wrapper.contains( 'Barnaby Blogwit' ) ).to.equal( true );
	} );

	it( 'should accept a custom class of `test__ace`', () => {
		const wrapper = shallow( <ReaderAuthorLink author={ author } className="test__ace">xyz</ReaderAuthorLink> );
		expect( wrapper.is( '.test__ace' ) ).to.equal( true );
	} );

	it( 'should return null with a null author name', () => {
		author.name = null;
		const wrapper = shallow( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( wrapper.type() ).to.be.null;
	} );

	it( 'should return null with a blacklisted author name', () => {
		author.name = 'admin';
		const wrapper = shallow( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( wrapper.type() ).to.be.null;
	} );

	it( 'should use siteUrl if provided', () => {
		const siteUrl = 'http://discover.wordpress.com';
		const wrapper = shallow( <ReaderAuthorLink author={ author } siteUrl={ siteUrl }>xyz</ReaderAuthorLink> );
		expect( wrapper.find( '.reader-author-link' ) ).to.have.prop( 'href' ).equal( siteUrl );
	} );

	it( 'should use author.URL if site URL is not provided', () => {
		const wrapper = shallow( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( wrapper.find( '.reader-author-link' ) ).to.have.prop( 'href' ).equal( author.URL );
	} );

	it( 'should not return a link if siteUrl and author.URL are both missing', () => {
		author.URL = null;
		const wrapper = shallow( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		// Should just return children
		expect( wrapper.html() ).to.equal( '<span class="reader-author-link">xyz</span>' );
	} );
} );
