/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { render, fireEvent, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
import '../matchMedia.mock';
import SuggestionItem from '../src/domain-picker/suggestion-item';

const testSuggestion = {
	domain_name: 'example.com',
	relevance: 0.9,
	supports_privacy: true,
	vendor: 'vendor',
	cost: '€15.00',
	product_id: 1234,
	product_slug: '1234',
};

/**
 * disabled the below test suite as these tests have been unmaintained whilst the codebase has moved on
 * and have now become stale. A separate task will be raised to fixed them. See https://github.com/Automattic/wp-calypso/issues/45501
 */

beforeAll( () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// ( window as any ).configData = require( '../../../../../../config/test.json' );
} );

/* eslint-disable */
describe.skip( 'traintracks events', () => {
	describe( 'render event', () => {
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
			{ prop: 'categorySlug', value1: null, value2: 'test_category' },
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

	describe( 'interact event', () => {
		it( 'sends interact event when selected', async () => {
			// Delay import so we have time to load configData in `beforeAll`
			const { default: SuggestionItem } = await import( '../suggestion-item' );

			const recordAnalytics = jest.fn();
			const railcarId = 'id';

			const { getByLabelText } = render(
				<SuggestionItem
					isSelected={ false }
					suggestion={ testSuggestion }
					onSelect={ jest.fn() }
					railcarId={ railcarId }
					recordAnalytics={ recordAnalytics }
					uiPosition={ 113 }
				/>
			);

			fireEvent.click(
				// Use function matcher to deal with the label containing <spans>
				getByLabelText( ( content, element ) => element.textContent === 'example.com' )
			);

			expect( recordAnalytics ).toHaveBeenCalledWith( {
				trainTracksType: 'interact',
				action: 'domain_selected',
				railcarId,
			} );
		} );

		it( "doesn't send interact event when deselected", async () => {
			// Delay import so we have time to load configData in `beforeAll`
			const { default: SuggestionItem } = await import( '../suggestion-item' );

			const recordAnalytics = jest.fn();

			const { getByLabelText } = render(
				<SuggestionItem
					isSelected={ true }
					suggestion={ testSuggestion }
					onSelect={ jest.fn() }
					railcarId="id"
					recordAnalytics={ recordAnalytics }
					uiPosition={ 113 }
				/>
			);

			fireEvent.click(
				// Use function matcher to deal with the label containing <spans>
				getByLabelText( ( content, element ) => element.textContent === 'example.com' )
			);

			expect( recordAnalytics ).not.toHaveBeenCalledWith(
				expect.objectContaining( {
					trainTracksType: 'interact',
				} )
			);
		} );
	} );
} );
/* eslint-enable */

describe( 'check conditional elements render correctly', () => {
	it( 'renders info tooltip for domains that require HSTS', async () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
		};

		render(
			<SuggestionItem
				{ ...testRequiredProps }
				onSelect={ jest.fn() }
				onRender={ jest.fn() }
				hstsRequired={ true }
			/>
		);

		expect( screen.getByTestId( 'info-tooltip' ) ).toBeTruthy();
	} );

	it( 'clicking info tooltip icon reveals popover for HSTS information text', async () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
		};

		render(
			<SuggestionItem
				{ ...testRequiredProps }
				onSelect={ jest.fn() }
				onRender={ jest.fn() }
				hstsRequired={ true }
			/>
		);

		fireEvent.click( screen.getByTestId( 'info-tooltip' ) );

		expect( screen.queryByText( /SSL certificate/i ) ).toBeTruthy();
	} );

	it( 'does not render info tooltip for domains that do not require HSTS', async () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
		};

		render(
			<SuggestionItem { ...testRequiredProps } onSelect={ jest.fn() } onRender={ jest.fn() } />
		);

		// use `queryBy` to avoid throwing an error with `getBy`
		expect( screen.queryByTestId( 'info-tooltip' ) ).toBeFalsy();
	} );

	it( 'renders recommendation badge if given prop isRecommended true', async () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
			isRecommended: true,
		};

		render(
			<SuggestionItem { ...testRequiredProps } onSelect={ jest.fn() } onRender={ jest.fn() } />
		);

		expect( screen.getByText( /Recommended/i ) ).toBeTruthy();
	} );

	it( 'renders the cost if given prop of cost with a value', async () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
			isRecommended: true,
		};

		render(
			<SuggestionItem { ...testRequiredProps } onSelect={ jest.fn() } onRender={ jest.fn() } />
		);

		expect( screen.queryByText( /€12.00/i ) ).toBeTruthy();
	} );

	it( 'renders the cost as free if given prop of isFree even though it has a cost prop', async () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
			isFree: true,
			isRecommended: true,
		};

		render(
			<SuggestionItem { ...testRequiredProps } onSelect={ jest.fn() } onRender={ jest.fn() } />
		);

		expect( screen.queryByText( /€12.00/i ) ).toBeFalsy();
		expect( screen.queryByText( /Free/i ) ).toBeTruthy();
	} );

	it( 'does not render recommendation badge if is given prop isRecommended false', async () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
			isRecommended: false,
		};

		render(
			<SuggestionItem { ...testRequiredProps } onSelect={ jest.fn() } onRender={ jest.fn() } />
		);

		// use `queryBy` to avoid throwing an error with `getBy`
		expect( screen.queryByText( /Recommended/i ) ).toBeFalsy();
	} );
} );

describe( 'test that suggested items are rendered correctly based on availability', () => {
	it( 'should have the disabled UI state when provided an availabilityStatus of unavailable', () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
			isRecommended: true,
			isUnavailable: true,
		};

		render(
			<SuggestionItem { ...testRequiredProps } onSelect={ jest.fn() } onRender={ jest.fn() } />
		);

		// we have to test for the domain and the TLD separately because they get split in the component
		expect( screen.queryByText( /testdomain/i ) ).toBeTruthy();
		expect( screen.queryAllByText( /.com/i ) ).toBeTruthy();

		expect( screen.queryByText( /Unavailable/i ) ).toBeTruthy();
		expect( screen.queryByText( /Recommended/i ) ).toBeFalsy();
		expect( screen.queryByRole( 'radio' ).getAttribute( 'disabled' ) ).not.toBe( null );
	} );

	it( 'should have the enabled UI state when provided an availabilityStatus that is available', () => {
		const testRequiredProps = {
			domain: 'testdomain.com',
			cost: '€12.00',
			railcarId: 'id',
			isRecommended: true,
			isUnavailable: false,
		};

		render(
			<SuggestionItem { ...testRequiredProps } onSelect={ jest.fn() } onRender={ jest.fn() } />
		);

		// we have to test for the domain and the TLD separately because they get split in the component
		expect( screen.queryByText( /testdomain/i ) ).toBeTruthy();
		expect( screen.queryAllByText( /.com/i ) ).toBeTruthy();

		expect( screen.queryByText( /Unavailable/i ) ).toBeFalsy();
		expect( screen.queryByText( /€12.00/i ) ).toBeTruthy();
		expect( screen.queryByText( /Recommended/i ) ).toBeTruthy();
		expect( screen.queryByRole( 'radio' ).getAttribute( 'disabled' ) ).toBe( null );
	} );
} );
