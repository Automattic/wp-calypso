/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */

import { SiteVerticalsSuggestionSearch } from '../';
import SuggestionSearch from 'components/suggestion-search';

const defaultProps = {
	onChange: jest.fn(),
	requestVerticals: jest.fn(),
	translate: str => str,
	initialValue: 'scooby',
	verticals: [ { vertical_name: 'doo', vertical_slug: 'doo', is_user_input_vertical: false } ],
	charsToTriggerSearch: 2,
};

defaultProps.requestVerticals.cancel = jest.fn();

describe( '<SiteVerticalsSuggestionSearch />', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	test( 'should render', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		expect( wrapper.find( SuggestionSearch ) ).toHaveLength( 1 );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should trigger search after > 1 characters and call `onChange` prop', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		wrapper.instance().onSiteTopicChange( 'b' );
		expect( defaultProps.requestVerticals ).not.toHaveBeenCalled();
		wrapper.instance().onSiteTopicChange( 'bo' );
		expect( defaultProps.requestVerticals ).toHaveBeenLastCalledWith( 'bo' );
		expect( defaultProps.onChange ).toHaveBeenLastCalledWith( {
			vertical_name: 'bo',
			vertical_slug: 'bo',
			is_user_input_vertical: true,
		} );
	} );

	test( 'should pass an exact non-user vertical match to the `onChange` prop', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		wrapper.instance().onSiteTopicChange( 'doo' );
		expect( defaultProps.onChange ).toHaveBeenLastCalledWith( defaultProps.verticals[ 0 ] );
	} );

	test( 'should cancel debounced invocations when the search value is falsey or has fewer chars than `props.charsToTriggerSearch`', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		wrapper.instance().onSiteTopicChange( 'b' );
		expect( defaultProps.requestVerticals.cancel ).toHaveBeenCalledTimes( 1 );
		wrapper.instance().onSiteTopicChange( null );
		expect( defaultProps.requestVerticals.cancel ).toHaveBeenCalledTimes( 2 );
	} );

	// TODO: test sortSearchResults
	test.skip( 'should sort suggestion results', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		wrapper.instance().sortSearchResults( [ '', '', '', '' ], 'b' );
	} );
} );
