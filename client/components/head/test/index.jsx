/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

describe( 'Head', () => {
	let Head;

	beforeAll( () => {
		Head = require( '../' );
	} );

	test( 'should render default title', () => {
		const wrapper = shallow( <Head /> );

		expect( wrapper.find( 'title' ).text() ).toBe( 'WordPress.com' );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render custom title', () => {
		const title = 'Arbitrary Custom Title';
		const wrapper = shallow( <Head title={ title } /> );

		expect( wrapper.find( 'title' ).text() ).toBe( title );
		expect( wrapper ).toMatchSnapshot();
	} );
} );
