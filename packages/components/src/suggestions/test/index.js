/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Suggestions from '..';
import Item from '../item';

const defaultProps = {
	suggest: jest.fn(),
	suggestions: [
		{
			label: 'Apple',
		},
		{
			label: 'Pear',
		},
		{
			label: 'Orange',
		},
	],
};

describe( '<Suggestions>', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	test( 'render basic list of suggestions', () => {
		const wrapper = shallow( <Suggestions { ...defaultProps } /> );
		expect( wrapper.find( Item ) ).toHaveLength( 3 );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'highlights the query inside the suggestions', () => {
		const wrapper = shallow( <Suggestions { ...defaultProps } query="LE" /> );
		expect( wrapper.find( { label: 'Pear' } ).prop( 'hasHighlight' ) ).toBe( false );
		expect( wrapper.find( { label: 'Orange' } ).prop( 'hasHighlight' ) ).toBe( false );
		expect( wrapper.find( { label: 'Apple' } ).prop( 'hasHighlight' ) ).toBe( true );
		expect( wrapper.find( { label: 'Apple' } ).prop( 'query' ) ).toBe( 'LE' );
	} );

	test( 'uncategorized suggestions always appear first', () => {
		const wrapper = shallow(
			<Suggestions
				{ ...defaultProps }
				suggestions={ [ { label: 'Carrot', category: 'Vegetable' }, ...defaultProps.suggestions ] }
			/>
		);

		const suggestions = wrapper.find( Item );

		expect( suggestions.at( 0 ).prop( 'label' ) ).toBe( 'Apple' );
		expect( suggestions.at( 1 ).prop( 'label' ) ).toBe( 'Pear' );
		expect( suggestions.at( 2 ).prop( 'label' ) ).toBe( 'Orange' );
		expect( suggestions.at( 3 ).prop( 'label' ) ).toBe( 'Carrot' );
	} );
} );
