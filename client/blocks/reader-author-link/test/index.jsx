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
import ReaderAuthorLink from '../index';
import useMockery from 'test/helpers/use-mockery';

describe( 'ReaderAuthorLink', () => {
	useMockery( mockery => {
		mockery.registerMock( 'reader/stats', {
			recordAction: noop,
			recordGaEvent: noop,
			recordTrackForPost: noop
		} );
	} );

	// check that content within a card renders correctly
	it( 'should render children', () => {
		const link = shallow( <ReaderAuthorLink>Barnaby Blogwit</ReaderAuthorLink> );
		expect( link.contains( 'Barnaby Blogwit' ) ).to.equal( true );
	} );
} );
