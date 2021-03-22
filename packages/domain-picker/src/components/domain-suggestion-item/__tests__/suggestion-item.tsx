/**
 * External dependencies
 */
import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';

/**
 * Internal dependencies
 */
// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
import '../../../__mocks__/matchMedia.mock';
import SuggestionItem from '../suggestion-item';

const MOCK_PROPS = {
	railcarId: 'id',
	domain: 'example.com',
	onSelect: jest.fn(),
	onRender: jest.fn(),
};

const renderComponent = ( props = {} ): RenderResult =>
	render( <SuggestionItem { ...MOCK_PROPS } { ...props } /> );

describe( 'traintracks events', () => {
	afterEach( () => {
		jest.clearAllMocks();
} );

/* eslint-disable */
describe.skip( 'traintracks events', () => {
	describe( 'render event', () => {
		it( 'should send render events when first rendered', async () => {
			renderComponent();

			expect( MOCK_PROPS.onRender ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not send a render event when re-rendered with the same props', async () => {
			const { rerender } = renderComponent();

			rerender( <SuggestionItem { ...MOCK_PROPS } /> );
			expect( MOCK_PROPS.onRender ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not send a render event when unrelated props change', async () => {
			const { rerender } = renderComponent();
			const updatedProps = { ...MOCK_PROPS, cost: '€11' };
			rerender( <SuggestionItem { ...updatedProps } /> );

			expect( updatedProps.onRender ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should send a render event when domain name and railcarId changes', async () => {
			const { rerender } = renderComponent();
			const updatedProps = { ...MOCK_PROPS, domain: 'example1.com', railcarId: 'id1' };
			rerender( <SuggestionItem { ...updatedProps } /> );

			expect( updatedProps.onRender ).toHaveBeenCalledTimes( 2 );
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

		expect( screen.queryByText( /Renews at: €12.00/i ) ).toBeTruthy();
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
		expect( screen.queryByRole( 'button' )?.getAttribute( 'disabled' ) ).not.toBe( null );
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
		expect( screen.queryByText( /Renews at: €12.00/i ) ).toBeTruthy();
		expect( screen.queryByText( /Recommended/i ) ).toBeTruthy();
		expect( screen.queryByRole( 'button' )?.getAttribute( 'disabled' ) ).toBe( null );
	} );
} );
