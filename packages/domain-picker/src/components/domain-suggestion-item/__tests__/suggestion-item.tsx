import { render, fireEvent, screen } from '@testing-library/react';
import { MOCK_SUGGESTION_ITEM_PARTIAL_PROPS } from '../__mocks__';
import SuggestionItem from '../suggestion-item';
import type { RenderResult } from '@testing-library/react';
// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
import '../../../__mocks__/matchMedia.mock';

jest.mock( '@automattic/calypso-config', () => ( {
	config: () => '',
} ) );

const renderComponent = ( props = {} ): RenderResult =>
	render( <SuggestionItem { ...MOCK_SUGGESTION_ITEM_PARTIAL_PROPS } { ...props } /> );

describe( 'traintracks events', () => {
	beforeEach( () => {
		global.ResizeObserver = require( 'resize-observer-polyfill' );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'render event', () => {
		it( 'should send render events when first rendered', async () => {
			renderComponent();

			expect( MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.onRender ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not send a render event when re-rendered with the same props', async () => {
			const { rerender } = renderComponent();

			MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.onRender.mockClear();
			rerender( <SuggestionItem { ...MOCK_SUGGESTION_ITEM_PARTIAL_PROPS } /> );

			expect( MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.onRender ).not.toHaveBeenCalled();
		} );

		it( 'should not send a render event when unrelated props change', async () => {
			const { rerender } = renderComponent();
			const updatedProps = { ...MOCK_SUGGESTION_ITEM_PARTIAL_PROPS };

			MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.onRender.mockClear();
			rerender( <SuggestionItem { ...updatedProps } /> );

			expect( updatedProps.onRender ).not.toHaveBeenCalled();
		} );

		it( 'should send a render event when domain name and railcarId changes', async () => {
			const { rerender } = renderComponent();
			const updatedProps = {
				...MOCK_SUGGESTION_ITEM_PARTIAL_PROPS,
				domain: 'example1.com',
				railcarId: 'id1',
			};

			MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.onRender.mockClear();
			rerender( <SuggestionItem { ...updatedProps } /> );

			expect( updatedProps.onRender ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'interact event', () => {
		it( 'should send an interact event when selected', async () => {
			renderComponent();

			fireEvent.click( screen.getByRole( 'button' ) );

			expect( MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.onSelect ).toHaveBeenCalledWith(
				MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.domain
			);
		} );
	} );
} );

describe( 'conditional elements', () => {
	/**
	 * TODO: Enable & Fix InfoTooltip tests when [#51175](https://github.com/Automattic/wp-calypso/issues/51175) is fixed
	 */

	/* eslint-disable jest/no-disabled-tests */
	it.skip( 'renders info tooltip for domains that require HSTS', async () => {
		render( <SuggestionItem { ...MOCK_SUGGESTION_ITEM_PARTIAL_PROPS } hstsRequired /> );

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
				hstsRequired
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

	it.skip( 'renders info tooltip for domains that require .gay information notice', async () => {
		render( <SuggestionItem { ...MOCK_SUGGESTION_ITEM_PARTIAL_PROPS } isDotGayNoticeRequired /> );

		expect( screen.getByTestId( 'info-tooltip' ) ).toBeInTheDocument();
	} );

	it.skip( 'clicking info tooltip icon reveals popover for .gay information notice', async () => {
		const testRequiredProps = {
			...MOCK_SUGGESTION_ITEM_PARTIAL_PROPS,
			domain: 'testdomain.gay',
			cost: '€37.00',
			railcarId: 'id',
			isDotGayNoticeRequired: true,
		};

		render( <SuggestionItem { ...testRequiredProps } /> );
		fireEvent.click( screen.getByTestId( 'info-tooltip' ) );

		expect( screen.queryByText( /Any anti-LGBTQ content/i ) ).toBeTruthy();
	} );
	/*eslint-enable*/

	it( 'should render a recommendation badge if given prop isRecommended true', async () => {
		renderComponent( { isRecommended: true } );

		expect( screen.getByText( /Recommended/i ) ).toBeInTheDocument();
	} );

	it( 'should render the cost if given prop of cost with a value', async () => {
		renderComponent();

		expect(
			screen.getByText(
				new RegExp( `Renews at: ${ MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.cost }`, 'i' )
			)
		).toBeInTheDocument();
	} );

	it( 'should render the cost as free if given prop of isFree even though it has a cost prop', async () => {
		renderComponent( { isFree: true } );

		expect(
			screen.queryByText( new RegExp( MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.cost, 'i' ) )
		).not.toBeInTheDocument();
		expect( screen.getByText( /Free/i ) ).toBeInTheDocument();
	} );

	it( 'should not render the recommendation badge if is given prop isRecommended false', async () => {
		renderComponent( { isRecommended: false } );

		expect( screen.queryByText( /Recommended/i ) ).not.toBeInTheDocument();
	} );
} );

describe( 'suggestion availability', () => {
	it( 'should have the disabled UI state when provided an availabilityStatus of unavailable', () => {
		renderComponent( { isRecommended: true, isUnavailable: true } );

		// we have to test for the domain and the TLD separately because they get split in the component

		const [ domain, tld ] = MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.domain.split( '.' );

		expect( screen.getByText( new RegExp( domain, 'i' ) ) ).toBeInTheDocument();
		expect( screen.getByText( new RegExp( `${ tld }$`, 'i' ) ) ).toBeInTheDocument();

		expect( screen.getByText( /Unavailable/i ) ).toBeInTheDocument();
		expect( screen.queryByText( /Recommended/i ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button' ) ).toBeDisabled();
	} );

	it( 'should have the enabled UI state when provided an availabilityStatus that is available', () => {
		renderComponent( { isRecommended: true, isUnavailable: false } );

		// we have to test for the domain and the TLD separately because they get split in the component
		const [ domain, tld ] = MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.domain.split( '.' );

		expect( screen.getByText( new RegExp( domain, 'i' ) ) ).toBeInTheDocument();
		expect( screen.getByText( new RegExp( `${ tld }$`, 'i' ) ) ).toBeInTheDocument();

		expect( screen.getByText( /Recommended/i ) ).toBeInTheDocument();
		expect(
			screen.getByText(
				new RegExp( `Renews at: ${ MOCK_SUGGESTION_ITEM_PARTIAL_PROPS.cost }`, 'i' )
			)
		).toBeInTheDocument();
		expect( screen.queryByText( /Unavailable/i ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button' ) ).not.toBeDisabled();
	} );
} );
