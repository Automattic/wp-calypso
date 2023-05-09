/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Theme } from '../';

jest.mock( 'calypso/components/popover-menu', () => 'components--popover--menu' );
jest.mock( 'calypso/components/popover-menu/item', () => 'components--popover--menu-item' );

jest.mock( '@automattic/calypso-config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn( () => {
		return true;
	} );
	return mock;
} );

describe( 'Theme', () => {
	const props = {
		theme: {
			id: 'twentyseventeen',
			name: 'Twenty Seventeen',
			screenshot:
				'https://i0.wp.com/s0.wp.com/wp-content/themes/pub/twentyseventeen/screenshot.png?ssl=1',
			price: 'U$50',
		},
		price: 'U$50',
		upsellUrl: 'premium/plan',
		buttonContents: { dummyAction: { label: 'Dummy action', action: jest.fn() } }, // TODO: test if called when clicked
		translate: ( string ) => string,
		setThemesBookmark: () => {},
		onScreenshotClick: () => {},
		isPremiumTheme: true,
	};

	function renderWithState( content ) {
		const initialState = {};
		const mockStore = configureStore();
		const store = mockStore( initialState );

		return render( <Provider store={ store }>{ content }</Provider> );
	}

	describe( 'Premium theme popover', () => {
		test( 'Free site', async () => {
			const { container } = renderWithState( <Theme { ...props } /> );
			const popoverTrigger = container.getElementsByClassName( 'theme__upsell-popover' )[ 0 ];
			await userEvent.hover( popoverTrigger );

			expect( screen.queryByTestId( 'upsell-header' ) ).toBeDefined();
			expect( screen.queryByTestId( 'upsell-header' ).innerHTML ).toBe( 'Premium theme' );
			expect( screen.queryByTestId( 'upsell-message' ).innerHTML ).toContain(
				'This premium theme is included in the'
			);
		} );

		test( 'Premium site', async () => {
			const { container } = renderWithState(
				<Theme { ...props } hasPremiumThemesFeature={ () => true } />
			);
			const popoverTrigger = container.getElementsByClassName( 'theme__upsell-popover' )[ 0 ];
			await userEvent.hover( popoverTrigger );

			expect( screen.queryByTestId( 'upsell-header' ) ).toBeDefined();
			expect( screen.queryByTestId( 'upsell-header' ).innerHTML ).toBe( 'Premium theme' );
			expect( screen.queryByTestId( 'upsell-message' ).innerHTML ).toContain(
				'This premium theme is included in your plan.'
			);
		} );

		test( 'Purchased a premium theme', async () => {
			const { container } = renderWithState( <Theme { ...props } didPurchaseTheme={ true } /> );
			const popoverTrigger = container.getElementsByClassName( 'theme__upsell-popover' )[ 0 ];
			await userEvent.hover( popoverTrigger );

			expect( screen.queryByTestId( 'upsell-header' ) ).toBeDefined();
			expect( screen.queryByTestId( 'upsell-header' ).innerHTML ).toBe( 'Premium theme' );
			expect( screen.queryByTestId( 'upsell-message' ).innerHTML ).toContain(
				'You have purchased this theme.'
			);
		} );
	} );
} );
