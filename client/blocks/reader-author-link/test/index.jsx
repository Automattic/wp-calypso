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
	let ReaderAuthorLink;

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

	// check that content within a card renders correctly
	it( 'should render children', () => {
		const author = { URL: 'http://wpcalypso.wordpress.com', name: 'Barnaby Blogwit' };
		const link = shallow( <ReaderAuthorLink author={ author }>Barnaby Blogwit</ReaderAuthorLink> );
		expect( link.contains( 'Barnaby Blogwit' ) ).to.equal( true );
	} );
} );
