/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { createBlock, getBlockType, getSaveElement } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { GutenbergBlock } from '../';

jest.mock( '@wordpress/blocks', () => ( {
	createBlock: jest.fn( () => ( {
		name: 'foo-name',
		attributes: 'foo-attributes',
		innerBlocks: 'foo-inner-blocks',
	} ) ),
	getBlockType: jest.fn( () => 'foo-block-type' ),
	getSaveElement: jest.fn(),
} ) );

describe( 'GutenbergBlock', () => {
	test( 'should render correctly', () => {
		const wrapper = shallow( <GutenbergBlock name="foo" attributes="bar" /> );
		expect( wrapper ).toMatchSnapshot();
		expect( createBlock ).toBeCalledWith( 'foo', 'bar', [] );
		expect( getBlockType ).toBeCalledWith( 'foo-name' );
		expect( getSaveElement ).toBeCalledWith(
			'foo-block-type',
			'foo-attributes',
			'foo-inner-blocks'
		);
	} );
} );
