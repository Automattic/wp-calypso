/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import PromoCards from '../';

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn();
	mockConfig.isEnabled = jest.fn();
	return mockConfig;
} );
jest.mock( '@automattic/calypso-router', () => ( { current: '/stats/day/example.com' } ) );
jest.mock( '@automattic/components', () => ( {
	DotPager: ( { children } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/blocks/promo-card-block', () => () => null );
jest.mock( 'calypso/components/app-promo-card', () => ( {
	AppPromoCard: () => <div>Jetpack app promo</div>,
} ) );
jest.mock( 'calypso/lib/promote-post', () => ( {
	PromoteWidgetStatus: { ENABLED: 'enabled' },
	usePromoteWidget: () => 'disabled',
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => () => false );
jest.mock( 'calypso/state/sites/selectors', () => ( { isJetpackSite: () => true } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSiteId: () => 1 } ) );

// Odyssey's production config returns `undefined` for a key the site did not print.
const mockOdysseyConfig = ( values ) => config.mockImplementation( ( key ) => values[ key ] );

const renderPromoCards = ( { isOdysseyStats = true, pageSlug = 'traffic' } = {} ) =>
	render(
		<Provider store={ createStore( () => ( {} ) ) }>
			<PromoCards isOdysseyStats={ isOdysseyStats } pageSlug={ pageSlug } slug="example.com" />
		</Provider>
	);

describe( 'PromoCards Jetpack app promo', () => {
	beforeEach( () => jest.clearAllMocks() );

	it.each( [ 'traffic', 'annual-insights', 'ads' ] )(
		'hides the promo and its view event on the %s page when the standalone Stats plugin runs without Jetpack',
		( pageSlug ) => {
			mockOdysseyConfig( { jetpack_version: '' } );

			const { container } = renderPromoCards( { pageSlug } );

			expect( container ).toBeEmptyDOMElement();
			expect( recordTracksEvent ).not.toHaveBeenCalled();
		}
	);

	it.each( [
		[ 'the Jetpack plugin is active', { jetpack_version: '15.0' } ],
		[ 'a Jetpack release older than the key omits it', {} ],
	] )( 'shows the promo in Odyssey when %s', ( _, values ) => {
		mockOdysseyConfig( values );

		renderPromoCards();

		expect( screen.getByText( 'Jetpack app promo' ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_stats_traffic_mobile_cta_jetpack_view',
			expect.anything()
		);
	} );

	it( 'shows the promo in Calypso without reading the Odyssey-only jetpack_version key, which throws there', () => {
		config.mockImplementation( ( key ) => {
			throw new ReferenceError( `Could not find config value for key '${ key }'` );
		} );

		renderPromoCards( { isOdysseyStats: false } );

		expect( screen.getByText( 'Jetpack app promo' ) ).toBeVisible();
	} );
} );
