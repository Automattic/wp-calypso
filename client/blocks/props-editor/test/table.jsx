/**
 * External dependencies
 */
import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Table from '../table';

describe( 'PropsEditor.Table', () => {
	it( 'renders a set of props', () => {
		const props = [
			{
				name: 'test1',
				type: 'string',
				value: 'testString1'
			},
			{
				name: 'test2',
				type: 'string',
				value: 'testString2'
			}
		];

		const wrapper = shallow( <Table props={ props } /> );
		assert( props.length, wrapper.children().length );
	} );
} );
