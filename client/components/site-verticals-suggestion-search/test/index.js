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

jest.mock( 'components/data/query-verticals', () => 'QueryVerticals' );

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
	defaultVerticalSearchTerm: 'eeek',
	defaultVertical: {
		verticalName: 'eeek',
		verticalSlug: 'ooofff',
		isUserInputVertical: true,
		preview: '<blink />',
		parent: 'whoops',
		verticalId: 'argh',
	},
	siteType: 'blog',
	searchValue: '',
	translate: str => str,
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

	test( 'should show popular topics', () => {
		const wrapper = shallow(
			<SiteVerticalsSuggestionSearch { ...defaultProps } showPopular={ true } />
		);
		expect( wrapper.find( PopularTopics ) ).toHaveLength( 1 );
	} );

	test( 'should pass default vertical search term to <QueryVerticals />', () => {
		const wrapper = shallow(
			<SiteVerticalsSuggestionSearch { ...defaultProps } showPopular={ true } />
		);
		const queryComponent = wrapper.find( 'QueryVerticals' ).at( 1 );

		expect( queryComponent.length ).toBe( 1 );
		expect( queryComponent.props().searchTerm ).toBe( defaultProps.defaultVerticalSearchTerm );
		expect( queryComponent.props().siteType ).toBe( defaultProps.siteType );
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
				verticalName: '',
				verticalSlug: '',
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
} );
