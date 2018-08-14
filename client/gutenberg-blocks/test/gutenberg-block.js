/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { getBlockType, getSaveElement } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { GutenbergBlock } from '../';

jest.mock( '@wordpress/blocks', () => ( {
	getBlockType: jest.fn( () => 'foo-block-type' ),
	getSaveElement: jest.fn(),
} ) );

describe( 'GutenbergBlock', () => {
	test( 'should render correctly', () => {
		const wrapper = shallow( <GutenbergBlock name="foo" attributes="bar" /> );
		expect( wrapper ).toMatchSnapshot();
		expect( getBlockType ).toBeCalledWith( 'foo' );
		expect( getSaveElement ).toBeCalledWith( 'foo-block-type', 'bar' );
	} );
} );
