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
	translate: ( str ) => str,
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

	test( 'should hide popular topics if showPopular is false', () => {
		const wrapper = shallow(
			<SiteVerticalsSuggestionSearch { ...defaultProps } showPopular={ false } />
		);
		expect( wrapper.find( PopularTopics ) ).toHaveLength( 0 );
	} );

	test( 'should hide popular topics if user has typed a query', () => {
		const wrapper = shallow(
			<SiteVerticalsSuggestionSearch
				{ ...defaultProps }
				searchValue={ 'Dogs' }
				showPopular={ true }
			/>
		);
		expect( wrapper.find( PopularTopics ) ).toHaveLength( 0 );
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

	test( "show verticals that don't match searchValue in the Related category", () => {
		const wrapper = shallow(
			<SiteVerticalsSuggestionSearch { ...defaultProps } searchValue="dog" />
		);
		wrapper.setProps( {
			verticals: [ { verticalName: 'Dogs' }, { verticalName: 'Doggo' }, { verticalName: 'Cats' } ],
		} );

		expect( wrapper.find( SuggestionSearch ).prop( 'suggestions' ) ).toEqual( [
			{ label: 'Dogs' },
			{ label: 'Doggo' },
			{ category: 'Related', label: 'Cats' },
		] );
	} );

	test( 'user input vertical is never shown in Related category', () => {
		const wrapper = shallow(
			<SiteVerticalsSuggestionSearch { ...defaultProps } searchValue="dog" />
		);
		wrapper.setProps( {
			verticals: [
				{ verticalName: 'Dogs' },
				{ verticalName: 'Doggo' },
				{ verticalName: 'Cats', isUserInputVertical: true },
			],
		} );

		expect( wrapper.find( SuggestionSearch ).prop( 'suggestions' ) ).toEqual( [
			{ label: 'Dogs' },
			{ label: 'Doggo' },
			{ label: 'Cats' },
		] );
	} );

	test( "don't show any related topics if query length is less than 3", () => {
		const wrapper = shallow(
			<SiteVerticalsSuggestionSearch { ...defaultProps } searchValue="do" />
		);
		wrapper.setProps( {
			verticals: [ { verticalName: 'Dogs' }, { verticalName: 'Doggo' }, { verticalName: 'Cats' } ],
		} );

		expect( wrapper.find( SuggestionSearch ).prop( 'suggestions' ) ).toEqual( [
			{ label: 'Dogs' },
			{ label: 'Doggo' },
		] );

		wrapper.instance().onSiteTopicChange( 'dog' );
		// Need to re-set the verticals prop again because `cDU` does reference equality
		// check before updating candidateVerticals
		wrapper.setProps( {
			verticals: [ { verticalName: 'Dogs' }, { verticalName: 'Doggo' }, { verticalName: 'Cats' } ],
		} );

		expect( wrapper.find( SuggestionSearch ).prop( 'suggestions' ) ).toEqual( [
			{ label: 'Dogs' },
			{ label: 'Doggo' },
			{ label: 'Cats', category: 'Related' },
		] );
	} );

	test( 'specifies which fetch_algo and ui_algo are being used for traintracks events', () => {
		const wrapper = shallow( <SiteVerticalsSuggestionSearch { ...defaultProps } /> );

		expect( wrapper.find( SuggestionSearch ).prop( 'railcar' ) ).toMatchObject( {
			fetch_algo: expect.any( String ),
			ui_algo: expect.any( String ),
		} );
	} );
} );
