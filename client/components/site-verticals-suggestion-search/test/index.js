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
import PopularTopics from 'components/site-verticals-suggestion-search/popular-topics';

jest.mock( 'uuid', () => ( {
	v4: () => 'fake-uuid',
} ) );

const defaultProps = {
	onChange: jest.fn(),
	verticals: [
		{
			verticalName: 'doo',
			verticalSlug: 'doo',
			isUserInputVertical: false,
			preview: '<marquee />',
			parent: 'hoo',
			verticalId: 'hoodoo',
		},
	],
	defaultVertical: {
		verticalName: 'eeek',
		verticalSlug: 'ooofff',
		isUserInputVertical: true,
		preview: '<blink />',
		parent: 'whoops',
		verticalId: 'argh',
	},
	translate: str => str,
	charsToTriggerSearch: 2,
	shouldShowPopularTopics: jest.fn(),
	searchValue: '',
};

describe( '<SiteVerticalsSuggestionSearch />', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	test( 'should render', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		expect( wrapper.find( SuggestionSearch ) ).toHaveLength( 1 );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should pass an exact non-user vertical match to the `onChange` prop', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		wrapper.instance().onSiteTopicChange( 'doo' );
		expect( defaultProps.onChange ).toHaveBeenLastCalledWith( defaultProps.verticals[ 0 ] );
	} );

	test( 'should show common topics', () => {
		defaultProps.shouldShowPopularTopics.mockReturnValueOnce( true );
		const wrapper = shallow(
			<SiteVerticalsSuggestionSearch { ...defaultProps } showPopular={ true } />
		);
		expect( defaultProps.shouldShowPopularTopics ).toHaveBeenLastCalledWith( '' );
		expect( wrapper.find( PopularTopics ) ).toHaveLength( 1 );
	} );

	describe( 'searchForVerticalMatches()', () => {
		test( 'should return `undefined` by default', () => {
			const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
			expect( wrapper.instance().searchForVerticalMatches() ).toBeUndefined();
		} );

		test( 'should return `undefined` when vertical preview is not in vertical item', () => {
			const wrapper = shallow(
				<SiteVerticalsSuggestionSearch
					{ ...defaultProps }
					verticals={ [ { verticalName: 'doo', verticalSlug: 'doo', isUserInputVertical: false } ] }
				/>
			);
			expect( wrapper.instance().searchForVerticalMatches() ).toBeUndefined();
		} );

		test( 'should return found match', () => {
			const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
			expect( wrapper.instance().searchForVerticalMatches( 'DOO' ) ).toEqual(
				defaultProps.verticals[ 0 ]
			);
		} );
	} );

	describe( 'updateVerticalData()', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		test( 'should return default vertical object', () => {
			wrapper.instance().updateVerticalData();
			expect( defaultProps.onChange ).toHaveBeenLastCalledWith( {
				verticalName: undefined,
				verticalSlug: undefined,
				isUserInputVertical: true,
				preview: defaultProps.defaultVertical.preview,
				verticalId: '',
				parent: '',
			} );
		} );

		test( 'should return default vertical object with value', () => {
			wrapper.instance().updateVerticalData( undefined, 'ciao' );
			expect( defaultProps.onChange ).toHaveBeenLastCalledWith( {
				verticalName: 'ciao',
				verticalSlug: 'ciao',
				isUserInputVertical: true,
				preview: defaultProps.defaultVertical.preview,
				verticalId: '',
				parent: '',
			} );
		} );

		test( 'should return result', () => {
			wrapper.instance().updateVerticalData( { deal: 'nodeal' }, 'ciao' );
			expect( defaultProps.onChange ).toHaveBeenLastCalledWith( { deal: 'nodeal' } );
		} );
	} );

	describe( 'sortSearchResults()', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );
		test( 'should return sorted results with `startsWith` matches at the start and exact match at the end', () => {
			const sortedResults = wrapper
				.instance()
				.sortSearchResults( [ 'Bar', 'Bari Beaches', 'Bartender', 'Foobar', 'Crowbar' ], ' bar ' );
			expect( sortedResults ).toEqual( [
				'Bari Beaches',
				'Bartender',
				'Foobar',
				'Crowbar',
				'Bar',
			] );
		} );

		test( 'should omit non-matches', () => {
			const sortedResults = wrapper
				.instance()
				.sortSearchResults( [ 'Bar', 'Bartender', 'Foobar', 'Terminal spiv' ], 'spiv' );
			expect( sortedResults ).toEqual( [ 'Terminal spiv' ] );
		} );

		test( 'should not sort when no `startsWith` suggestions', () => {
			const sortedResults = wrapper
				.instance()
				.sortSearchResults( [ 'Stammabschnitt', 'Tim Tam', '123 Tam', 'Tam' ], 'tam' );
			expect( sortedResults ).toEqual( [ 'Stammabschnitt', 'Tim Tam', '123 Tam', 'Tam' ] );
		} );
	} );
} );
