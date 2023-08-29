/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ThemeTypeBadge from '../';

describe( 'ThemeTypeBadge', () => {
	function renderWithState( content, { hasPremiumPlan = false, hasPurchasedTheme = false } = {} ) {
		const initialState = {
			themes: {
				queries: {
					wpcom: {
						getItem: () => ( {
							stylesheet: 'premium/test',
						} ),
					},
				},
			},
			sites: {
				features: {
					123: {
						data: {
							active: hasPremiumPlan ? [ 'premium-themes' ] : [],
						},
					},
				},
			},
			ui: { selectedSiteId: 123 },
			purchases: {
				data: hasPurchasedTheme
					? [ { blog_id: 123, product_type: 'theme', meta: 'premium/test' } ]
					: [],
			},
		};
		const mockStore = configureStore();
		const store = mockStore( initialState );

		return render( <Provider store={ store }>{ content }</Provider> );
	}

	describe( 'Premium theme popover', () => {
		test( 'Free site', async () => {
			const { container } = renderWithState(
				<ThemeTypeBadge siteId={ 123 } siteSlug="example.com" themeId="premium/test" />
			);
			const popoverTrigger = container.getElementsByClassName( 'theme-type-badge__content' )[ 0 ];
			await userEvent.hover( popoverTrigger );

			expect( screen.queryByTestId( 'upsell-header' ) ).toBeDefined();
			expect( screen.queryByTestId( 'upsell-header' ).innerHTML ).toBe( 'Premium theme' );
			expect( screen.queryByTestId( 'upsell-message' ).innerHTML ).toContain(
				'This premium theme is included in the'
			);
		} );

		test( 'Premium site', async () => {
			const { container } = renderWithState(
				<ThemeTypeBadge siteId={ 123 } siteSlug="example.com" themeId="premium/test" />,
				{
					hasPremiumPlan: true,
				}
			);
			const popoverTrigger = container.getElementsByClassName( 'theme-type-badge__content' )[ 0 ];
			await userEvent.hover( popoverTrigger );

			expect( screen.queryByTestId( 'upsell-header' ) ).toBeDefined();
			expect( screen.queryByTestId( 'upsell-header' ).innerHTML ).toBe( 'Premium theme' );
			expect( screen.queryByTestId( 'upsell-message' ).innerHTML ).toContain(
				'This premium theme is included in your plan.'
			);
		} );

		test( 'Purchased a premium theme', async () => {
			const { container } = renderWithState(
				<ThemeTypeBadge siteId={ 123 } siteSlug="example.com" themeId="premium/test" />,
				{
					hasPurchasedTheme: true,
				}
			);
			const popoverTrigger = container.getElementsByClassName( 'theme-type-badge__content' )[ 0 ];
			await userEvent.hover( popoverTrigger );

			expect( screen.queryByTestId( 'upsell-header' ) ).toBeDefined();
			expect( screen.queryByTestId( 'upsell-header' ).innerHTML ).toBe( 'Premium theme' );
			expect( screen.queryByTestId( 'upsell-message' ).innerHTML ).toContain(
				'You have purchased this theme.'
			);
		} );
	} );
} );
