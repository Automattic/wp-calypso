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
		it( 'should send an interact event when selected', async () => {
			renderComponent();

			fireEvent.click( screen.getByRole( 'button' ) );

			expect( MOCK_PROPS.onSelect ).toHaveBeenCalledWith( MOCK_PROPS.domain );
			} );
		} );
		} );

describe( 'check conditional elements render correctly', () => {
	/**
	 * TODO: Enable & Fix InfoTooltip tests when [#51175](https://github.com/Automattic/wp-calypso/issues/51175) is fixed
	 */

	/* eslint-disable jest/no-disabled-tests */
	it.skip( 'renders info tooltip for domains that require HSTS', async () => {
		render( <SuggestionItem { ...MOCK_PROPS } hstsRequired={ true } /> );

		expect( screen.getByTestId( 'info-tooltip' ) ).toBeInTheDocument();
	} );

	it.skip( 'clicking info tooltip icon reveals popover for HSTS information text', async () => {
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

	it.skip( 'does not render info tooltip for domains that do not require HSTS', async () => {
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
	/*eslint-enable*/

	it( 'should render a recommendation badge if given prop isRecommended true', async () => {
		renderComponent( { cost: '€12.00', isRecommended: true } );

		expect( screen.getByText( /Recommended/i ) ).toBeInTheDocument();
	} );

	it( 'should render the cost if given prop of cost with a value', async () => {
		renderComponent( { cost: '€12.00' } );

		expect( screen.getByText( /Renews at: €12.00/i ) ).toBeInTheDocument();
	} );

	it( 'should render the cost as free if given prop of isFree even though it has a cost prop', async () => {
		renderComponent( { cost: '€12.00', isFree: true } );

		expect( screen.queryByText( /€12.00/i ) ).not.toBeInTheDocument();
		expect( screen.getByText( /Free/i ) ).toBeInTheDocument();
	} );

	it( 'should not render the recommendation badge if is given prop isRecommended false', async () => {
		renderComponent( { cost: '€12.00', isRecommended: false } );

		expect( screen.queryByText( /Recommended/i ) ).not.toBeInTheDocument();
	} );
} );

describe( 'test that suggested items are rendered correctly based on availability', () => {
	it( 'should have the disabled UI state when provided an availabilityStatus of unavailable', () => {
		renderComponent( { cost: '€12.00', isRecommended: true, isUnavailable: true } );

		// we have to test for the domain and the TLD separately because they get split in the component

		const [ domain, tld ] = MOCK_PROPS.domain.split( '.' );
		expect( screen.getByText( new RegExp( domain, 'i' ) ) ).toBeInTheDocument();
		expect( screen.getByText( new RegExp( tld, 'i' ) ) ).toBeInTheDocument();

		expect( screen.getByText( /Unavailable/i ) ).toBeInTheDocument();
		expect( screen.queryByText( /Recommended/i ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button' ) ).toBeDisabled();
	} );

	it( 'should have the enabled UI state when provided an availabilityStatus that is available', () => {
		renderComponent( { cost: '€12.00', isRecommended: true, isUnavailable: false } );

		// we have to test for the domain and the TLD separately because they get split in the component
		const [ domain, tld ] = MOCK_PROPS.domain.split( '.' );

		expect( screen.getByText( new RegExp( domain, 'i' ) ) ).toBeInTheDocument();
		expect( screen.getByText( new RegExp( `${ tld }$`, 'i' ) ) ).toBeInTheDocument();

		expect( screen.getByText( /Recommended/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Renews at: €12.00/i ) ).toBeInTheDocument();
		expect( screen.queryByText( /Unavailable/i ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button' ) ).not.toBeDisabled();
	} );
} );
