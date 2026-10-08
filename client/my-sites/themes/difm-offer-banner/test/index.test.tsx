/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDifmOffer } from 'calypso/dashboard/utils/difm-offer';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import preferencesReducer from 'calypso/state/preferences/reducer';
import themesReducer from 'calypso/state/themes/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DifmOfferBanner from '../index';

jest.mock( 'calypso/dashboard/utils/difm-offer', () => ( {
	...jest.requireActual( 'calypso/dashboard/utils/difm-offer' ),
	useDifmOffer: jest.fn(),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( {
		type: 'ANALYTICS_EVENT_RECORD',
	} ) ),
} ) );

// Store the value locally without the API request, as the real thunk does first.
jest.mock( 'calypso/state/preferences/actions', () => {
	const actual = jest.requireActual( 'calypso/state/preferences/actions' );
	return {
		...actual,
		savePreference: jest.fn( ( key, value ) => actual.setPreference( key, value ) ),
	};
} );

const SITE_ID = 123;
const DISMISSED_PREFERENCE = 'hosting-dashboard-difm-offer-dismissed';

// A selected site that the user can upgrade lets Banner build a /plans/ href
// unless `disableHref` is set, so the fixture exercises that guard.
const initialState = {
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				URL: 'https://example.wordpress.com',
				plan: { product_slug: 'free_plan' },
				options: { created_at: '2026-10-01T00:00:00+00:00' },
				is_a4a_dev_site: false,
			},
		},
	},
	currentUser: {
		capabilities: { [ SITE_ID ]: { manage_options: true } },
	},
	ui: { language: { localeSlug: 'en' }, selectedSiteId: SITE_ID },
};

function renderBanner(
	siteId: number | null = SITE_ID,
	{ upsellCardDisplayed = false, remoteValues = {} as Record< string, unknown > | null } = {}
) {
	return renderWithProvider( <DifmOfferBanner siteId={ siteId } />, {
		initialState: {
			...initialState,
			themes: { upsellCardDisplayed },
			preferences: { localValues: {}, remoteValues },
		},
		reducers: { ui: uiReducer, themes: themesReducer, preferences: preferencesReducer },
	} );
}

function mockOffer( result: ReturnType< typeof useDifmOffer > ) {
	( useDifmOffer as jest.Mock ).mockReturnValue( result );
}

describe( 'DifmOfferBanner', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders the variation copy for an eligible assigned user', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		renderBanner();

		expect( screen.getByText( 'No time to build your site?' ) ).toBeVisible();
		expect( screen.getByText( /Ready in 4 days/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'See the offer' } ) ).toBeVisible();
		expect( useDifmOffer ).toHaveBeenCalledWith( {
			planSlug: 'free_plan',
			siteCreatedAt: '2026-10-01T00:00:00+00:00',
			localeSlug: 'en',
			isA4ADevSite: false,
		} );
	} );

	test( 'gives the CTA no destination', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		renderBanner();

		const cta = screen.getByRole( 'button', { name: 'See the offer' } );
		expect( cta ).not.toHaveAttribute( 'href' );
	} );

	test( 'records the impression and click with the variation', async () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		renderBanner();

		const expectedProperties = expect.objectContaining( {
			cta_name: 'themes-difm-offer',
			upsell_id: 'themes-difm-offer',
			upsell_feature_id: 'difm-offer',
			variation: 'no_time',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_banner_cta_impression',
			expectedProperties
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'See the offer' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_banner_cta_click',
			expectedProperties
		);
	} );

	test( 'saves the dismissal and hides the banner when closed', async () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		const { container } = renderBanner();

		await userEvent.click( container.querySelector( '.banner__close-icon' ) as Element );

		expect( savePreference ).toHaveBeenCalledWith(
			DISMISSED_PREFERENCE,
			expect.stringMatching( /^\d{4}-\d{2}-\d{2}T/ )
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'records the dismissal with the variation', async () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		const { container } = renderBanner();

		await userEvent.click( container.querySelector( '.banner__close-icon' ) as Element );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_banner_dismiss',
			expect.objectContaining( {
				cta_name: 'themes-difm-offer',
				upsell_id: 'themes-difm-offer',
				upsell_feature_id: 'difm-offer',
				variation: 'no_time',
			} )
		);
	} );

	test( 'renders nothing once dismissed', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		const { container } = renderBanner( SITE_ID, {
			remoteValues: { [ DISMISSED_PREFERENCE ]: '2026-10-08T00:00:00.000Z' },
		} );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing while preferences load', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		const { container } = renderBanner( SITE_ID, { remoteValues: null } );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing for control', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'control' } );
		const { container } = renderBanner();
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing for an ineligible user', () => {
		mockOffer( { isEligible: false, isLoading: false, variation: 'no_time' } );
		const { container } = renderBanner();
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing while the assignment loads', () => {
		mockOffer( { isEligible: true, isLoading: true, variation: 'no_time' } );
		const { container } = renderBanner();
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing while the upsell card shows', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		const { container } = renderBanner( SITE_ID, { upsellCardDisplayed: true } );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing without a selected site', () => {
		mockOffer( { isEligible: true, isLoading: false, variation: 'no_time' } );
		const { container } = renderBanner( null );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
