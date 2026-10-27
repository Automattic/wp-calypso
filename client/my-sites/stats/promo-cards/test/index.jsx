/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { usePromoteWidget } from 'calypso/lib/promote-post';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import PromoCards from '../';

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );
let mockValues = {};
jest.mock( '@automattic/calypso-config', () => {
	// Like a development build, `config()` throws for a key the site did not print.
	const mockConfig = ( key ) => {
		if ( key in mockValues ) {
			return mockValues[ key ];
		}
		throw new ReferenceError( `Could not find config value for key '${ key }'` );
	};
	mockConfig.isEnabled = () => false;
	return { __esModule: true, default: mockConfig, optionalConfig: ( key ) => mockValues[ key ] };
} );
jest.mock( '@automattic/calypso-router', () => ( { current: '' } ) );
jest.mock( '@automattic/components', () => ( {
	DotPager: ( { children } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/blocks/promo-card-block', () => ( { productSlug } ) => (
	<div>{ productSlug } promo</div>
) );
jest.mock( 'calypso/components/app-promo-card', () => ( {
	AppPromoCard: () => <div>Jetpack app promo</div>,
} ) );
jest.mock( 'calypso/lib/promote-post', () => ( {
	PromoteWidgetStatus: { ENABLED: 'enabled' },
	usePromoteWidget: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => () => false );
jest.mock( 'calypso/state/sites/selectors', () => ( { isJetpackSite: jest.fn() } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSiteId: () => 1 } ) );

const mockConfigValues = ( values ) => {
	mockValues = values;
};

const renderPromoCards = ( { isOdysseyStats = true, pageSlug = 'traffic' } = {} ) =>
	render(
		<Provider store={ createStore( () => ( {} ) ) }>
			<PromoCards isOdysseyStats={ isOdysseyStats } pageSlug={ pageSlug } slug="example.com" />
		</Provider>
	);

describe( 'PromoCards', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		page.current = '/stats/day/example.com';
		usePromoteWidget.mockReturnValue( 'disabled' );
		isJetpackSite.mockReturnValue( true );
	} );

	it.each( [ 'traffic', 'annual-insights', 'ads' ] )(
		'hides the Jetpack app promo and its view event on the %s page when the standalone Stats plugin runs without Jetpack',
		( pageSlug ) => {
			mockConfigValues( { jetpack_version: '' } );

			const { container } = renderPromoCards( { pageSlug } );

			expect( container ).toBeEmptyDOMElement();
			expect( recordTracksEvent ).not.toHaveBeenCalled();
		}
	);

	it.each( [
		[ 'the Jetpack plugin is active', { jetpack_version: '15.0' } ],
		[ 'a Jetpack release older than the key omits it', {} ],
	] )( 'shows the Jetpack app promo in Odyssey when %s', ( _, values ) => {
		mockConfigValues( values );

		renderPromoCards();

		expect( screen.getByText( 'Jetpack app promo' ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_traffic_mobile_cta_jetpack_view',
			expect.anything()
		);
	} );

	it( 'keeps the Blaze, Yoast and Jetpack app promos, in that order, on the Calypso annual stats page', () => {
		mockConfigValues( {} );
		page.current = '/stats/annualstats/example.com';
		usePromoteWidget.mockReturnValue( 'enabled' );
		isJetpackSite.mockReturnValue( false );

		renderPromoCards( { isOdysseyStats: false } );

		expect( screen.getAllByText( / promo$/ ).map( ( card ) => card.textContent ) ).toEqual( [
			'blaze promo',
			'wordpress-seo-premium promo',
			'Jetpack app promo',
		] );
	} );
} );
