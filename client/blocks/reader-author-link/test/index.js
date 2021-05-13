/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAuthorLink from '../index';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: () => {},
	recordGaEvent: () => {},
	recordTrackForPost: () => {},
} ) );

describe( 'ReaderAuthorLink', () => {
	let author;

	beforeEach( () => {
		author = { URL: 'http://wpcalypso.wordpress.com', name: 'Barnaby Blogwit' };
	} );

	test( 'should render children', () => {
		const wrapper = shallow(
			<ReaderAuthorLink author={ author }>Barnaby Blogwit</ReaderAuthorLink>
		);
		expect( wrapper.contains( 'Barnaby Blogwit' ) ).toEqual( true );
	} );

	test( 'should accept a custom class of `test__ace`', () => {
		const wrapper = shallow(
			<ReaderAuthorLink author={ author } className="test__ace">
				xyz
			</ReaderAuthorLink>
		);
		expect( wrapper.is( '.test__ace' ) ).toEqual( true );
	} );

	test( 'should return null with a null author name', () => {
		author.name = null;
		const wrapper = shallow( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( wrapper.type() ).toBe( null );
	} );

	test( 'should return null with a blocked author name', () => {
		author.name = 'admin';
		const wrapper = shallow( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( wrapper.type() ).toBe( null );
	} );

	test( 'should use siteUrl if provided', () => {
		const siteUrl = 'http://discover.wordpress.com';
		const wrapper = shallow(
			<ReaderAuthorLink author={ author } siteUrl={ siteUrl }>
				xyz
			</ReaderAuthorLink>
		);
		expect( wrapper.find( '.reader-author-link' ).prop( 'href' ) ).toEqual( siteUrl );
	} );

	test( 'should use author.URL if site URL is not provided', () => {
		const wrapper = shallow( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		expect( wrapper.find( '.reader-author-link' ).prop( 'href' ) ).toEqual( author.URL );
	} );

	test( 'should not return a link if siteUrl and author.URL are both missing', () => {
		author.URL = null;
		const wrapper = shallow( <ReaderAuthorLink author={ author }>xyz</ReaderAuthorLink> );
		// Should just return children
		expect( wrapper.type() ).toEqual( 'span' );
	} );
} );
