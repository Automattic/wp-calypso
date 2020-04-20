/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import * as React from 'react';
import { render } from '@testing-library/react';

const testSuggestion = {
	domain_name: 'example.com',
	relevance: 0.9,
	supports_privacy: true,
	vendor: 'vendor',
	cost: '€15.00',
	product_id: 1234,
	product_slug: '1234',
};

beforeAll( () => {
	( window as any ).configData = require( '../../../../../../config/test.json' );
} );

describe( 'traintracks events', () => {
	it( 'sends render events when first rendered', async () => {
		// Delay import so we have time to load configData in `beforeAll`
		const { default: SuggestionItem } = await import( '../suggestion-item' );

		const recordAnalytics = jest.fn();
		const railcarId = 'id';
		const uiPosition = 113;

		render(
			<SuggestionItem
				suggestion={ testSuggestion }
				onSelect={ jest.fn() }
				railcarId={ railcarId }
				recordAnalytics={ recordAnalytics }
				uiPosition={ uiPosition }
			/>
		);

		expect( recordAnalytics ).toHaveBeenCalledWith(
			expect.objectContaining( {
				railcarId,
				result: testSuggestion.domain_name,
				trainTracksType: 'render',
				uiPosition,
			} )
		);
	} );

	it( "doesn't send render event when re-rendered with the same props", async () => {
		// Delay import so we have time to load configData in `beforeAll`
		const { default: SuggestionItem } = await import( '../suggestion-item' );

		const recordAnalytics = jest.fn();

		const props = {
			suggestion: testSuggestion,
			onSelect: jest.fn(),
			railcarId: 'id',
			recordAnalytics,
			uiPosition: 113,
		};

		const { rerender } = render( <SuggestionItem { ...props } /> );

		recordAnalytics.mockClear();

		rerender( <SuggestionItem { ...props } /> );

		expect( recordAnalytics ).not.toHaveBeenCalled();
	} );

	it( "doesn't send render event when unrelated props change", async () => {
		// Delay import so we have time to load configData in `beforeAll`
		const { default: SuggestionItem } = await import( '../suggestion-item' );

		const unchangedProps = {
			isRecommended: true,
			railcarId: 'id',
			uiPosition: 113,
		};

		const { rerender } = render(
			<SuggestionItem
				{ ...unchangedProps }
				suggestion={ { ...testSuggestion, domain_name: 'example.com' } }
				isSelected={ false }
				onSelect={ jest.fn() }
				recordAnalytics={ jest.fn() }
			/>
		);

		const recordAnalytics = jest.fn();

		rerender(
			<SuggestionItem
				{ ...unchangedProps }
				// Suggestion object is changed, but the domain name itself isn't changed
				suggestion={ { ...testSuggestion, domain_name: 'example.com' } }
				isSelected={ true }
				onSelect={ jest.fn() }
				recordAnalytics={ recordAnalytics }
			/>
		);

		expect( recordAnalytics ).not.toHaveBeenCalled();
	} );

	it( 'sends render event when domain name and railcarId changes', async () => {
		// Delay import so we have time to load configData in `beforeAll`
		const { default: SuggestionItem } = await import( '../suggestion-item' );

		const recordAnalytics = jest.fn();

		const props = {
			isSelected: false,
			onSelect: jest.fn(),
			railcarId: 'id1',
			recordAnalytics,
		};

		const { rerender } = render(
			<SuggestionItem
				{ ...props }
				suggestion={ { ...testSuggestion, domain_name: 'example1.com' } }
				isRecommended={ true }
				railcarId="id1"
				uiPosition={ 1 }
			/>
		);

		expect( recordAnalytics ).toHaveBeenCalled();

		rerender(
			<SuggestionItem
				{ ...props }
				suggestion={ { ...testSuggestion, domain_name: 'example2.com' } }
				isRecommended={ false }
				railcarId="id2"
				uiPosition={ 2 }
			/>
		);

		expect( recordAnalytics ).toHaveBeenCalledTimes( 2 );
		expect( recordAnalytics ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				railcarId: 'id2',
				result: 'example2.com',
				trainTracksType: 'render',
				uiPosition: 2,
			} )
		);
	} );

	[
		{ prop: 'railcarId', value1: 'id1', value2: 'id2' },
		{ prop: 'isRecommended', value1: true, value2: false },
		{ prop: 'uiPosition', value1: 1, value2: 2 },
		{
			prop: 'suggestion',
			value1: { ...testSuggestion, domain_name: 'example1.com' },
			value2: { ...testSuggestion, domain_name: 'example2.com' },
		},
	].forEach( ( { prop, value1, value2 } ) => {
		it( `doesn't send render event when only "${ prop }" changes`, async () => {
			// Delay import so we have time to load configData in `beforeAll`
			const { default: SuggestionItem } = await import( '../suggestion-item' );

			const recordAnalytics = jest.fn();

			const props = {
				suggestion: testSuggestion,
				onSelect: jest.fn(),
				railcarId: 'id',
				recordAnalytics,
				uiPosition: 113,
				[ prop ]: value1,
			};

			const { rerender } = render( <SuggestionItem { ...props } /> );

			expect( recordAnalytics ).toHaveBeenCalledWith(
				expect.objectContaining( {
					railcarId: props.railcarId,
					result: expect.stringContaining( props.suggestion.domain_name ),
					trainTracksType: 'render',
					uiPosition: props.uiPosition,
				} )
			);

			recordAnalytics.mockClear();
			props[ prop ] = value2;

			rerender( <SuggestionItem { ...props } /> );

			expect( recordAnalytics ).not.toHaveBeenCalled();
		} );
	} );
} );
