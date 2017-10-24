/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { render } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import makeTaggedMock from '..';

describe( 'makeTaggedMock', () => {
	test( 'should produce a tagged mock when testing', () => {
		const tree = render( React.createElement( makeTaggedMock( 'mock-tag' ) ) );
		expect( tree ).toMatchSnapshot();
	} );
} );
