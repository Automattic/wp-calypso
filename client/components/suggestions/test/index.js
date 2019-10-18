/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { mount, shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Suggestions from '..';
import Item from '../item';
import { tracks } from 'lib/analytics';

jest.mock( 'lib/analytics', () => ( {
	tracks: {
		recordEvent: jest.fn(),
	},
} ) );

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

	test( 'rendering fires traintracks render events', () => {
		mount(
			<Suggestions
				{ ...defaultProps }
				railcar={ {
					id: 'abcd',
					fetch_algo: 'fetch_algo',
					ui_algo: 'ui_algo',
				} }
			/>
		);

		expect( tracks.recordEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
			railcar: 'abcd-0',
			fetch_algo: 'fetch_algo',
			fetch_position: 0,
			ui_algo: 'ui_algo',
			ui_position: 0,
		} );
		expect( tracks.recordEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
			railcar: 'abcd-1',
			fetch_algo: 'fetch_algo',
			fetch_position: 1,
			ui_algo: 'ui_algo',
			ui_position: 1,
		} );
		expect( tracks.recordEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
			railcar: 'abcd-2',
			fetch_algo: 'fetch_algo',
			fetch_position: 2,
			ui_algo: 'ui_algo',
			ui_position: 2,
		} );
	} );

	test( 'traintrack events use correct ui_position when suggestions have re-ordered into categories', () => {
		mount(
			<Suggestions
				{ ...defaultProps }
				suggestions={ [ { label: 'Carrot', category: 'Vegetable' }, ...defaultProps.suggestions ] }
				railcar={ {
					id: 'abcd',
					fetch_algo: 'fetch_algo',
					ui_algo: 'ui_algo',
				} }
			/>
		);

		expect( tracks.recordEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
			railcar: 'abcd-0',
			fetch_algo: 'fetch_algo',
			fetch_position: 0,
			ui_algo: 'ui_algo',
			ui_position: 3,
		} );
		expect( tracks.recordEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
			railcar: 'abcd-1',
			fetch_algo: 'fetch_algo',
			fetch_position: 1,
			ui_algo: 'ui_algo',
			ui_position: 0,
		} );
		expect( tracks.recordEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
			railcar: 'abcd-2',
			fetch_algo: 'fetch_algo',
			fetch_position: 2,
			ui_algo: 'ui_algo',
			ui_position: 1,
		} );
		expect( tracks.recordEvent ).toHaveBeenCalledWith( 'calypso_traintracks_render', {
			railcar: 'abcd-3',
			fetch_algo: 'fetch_algo',
			fetch_position: 3,
			ui_algo: 'ui_algo',
			ui_position: 2,
		} );
	} );

	test( 'mousedown fires traintracks interact event', () => {
		const wrapper = mount(
			<Suggestions
				{ ...defaultProps }
				railcar={ {
					id: 'abcd',
					action: 'action-name',
				} }
			/>
		);

		wrapper
			.find( Item )
			.at( 0 )
			.simulate( 'mousedown' );

		expect( tracks.recordEvent ).toHaveBeenCalledWith( 'calypso_traintracks_interact', {
			railcar: 'abcd-0',
			action: 'action-name',
		} );
	} );
} );
