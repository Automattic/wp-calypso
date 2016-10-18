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
		author = { URL: 'http://wpcalypso.wordpress.com', name: 'Barnaby Blogwit' };
	} );

	it( 'should render children', () => {
		const link = shallow( <ReaderAuthorLink author={ author }>Barnaby Blogwit</ReaderAuthorLink> );
		expect( link.contains( 'Barnaby Blogwit' ) ).to.equal( true );
	} );

	it( 'should accept a custom class of `test__ace`', () => {
		const link = shallow( <ReaderAuthorLink author={ author } className="test__ace">xyz</ReaderAuthorLink> );
		expect( link.is( '.test__ace' ) ).to.equal( true );
	} );

	it( 'it should return null with a null author name', () => {
		author.name = null;
		const link = shallow( <ReaderAuthorLink author={ author } className="test__ace">xyz</ReaderAuthorLink> );
		expect( link.type() ).to.be.null;
	} );

	it( 'it should return null with a blacklisted author name', () => {
		author.name = 'admin';
		const link = shallow( <ReaderAuthorLink author={ author } className="test__ace">xyz</ReaderAuthorLink> );
		expect( link.type() ).to.be.null;
	} );
} );
