/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { createBlock, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { GutenbergBlock } from '../';

jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn( () => 'block-foo' ),
	serialize: jest.fn( () => 'serialize-foo' ),
} ) );

describe( 'GutenbergBlock', () => {
	test( 'should render correctly', () => {
		const wrapper = shallow( <GutenbergBlock name="foo" attributes="bar" /> );
		expect( wrapper ).toMatchSnapshot();
		expect( createBlock ).toBeCalledWith( 'foo', 'bar', [] );
		expect( serialize ).toBeCalledWith( 'block-foo' );
	} );
} );
