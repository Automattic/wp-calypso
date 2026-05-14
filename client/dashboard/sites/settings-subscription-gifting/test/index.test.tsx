/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SubscriptionGiftingSettings from '../index';
import type { Site, SiteSettings } from '@automattic/api-core';

const API_BASE = 'https://public-api.wordpress.com';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	plan: {
		product_slug: 'value_bundle',
		product_name_short: 'Personal',
		is_free: false,
		features: {
			active: [ 'subscription-gifting' ],
		},
	},
} as Site;

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ),
	useRegistry: () => ( {} ),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn( ( selector: unknown ) => selector ),
	store: jest.fn(),
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_x: ( text: string ) => text,
	isRTL: () => false,
	sprintf: ( text: string ) => text,
} ) );

function mockSite( mockedSite: Site ) {
	nock( API_BASE )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockSiteSettings( settings: Partial< SiteSettings > ) {
	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ site.ID }/settings` )
		.query( true )
		.reply( 200, { settings } );
}

function mockWordadsStatus( unsafe: false | 'mature' | 'private' | 'spam' | 'other' ) {
	nock( API_BASE )
		.get( `/rest/v1.1/sites/${ site.ID }/wordads/account` )
		.query( true )
		.reply( 200, { unsafe, approved: false, active: false } );
}

describe( '<SubscriptionGiftingSettings>', () => {
	beforeEach( () => {
		nock.cleanAll();
	} );

	test( 'renders the gifting settings form for a normal site', async () => {
		mockSite( site );
		mockSiteSettings( { wpcom_gifting_subscription: false } );
		mockWordadsStatus( false );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } );

		expect(
			screen.getByRole( 'button', { name: 'Save' } )
		).toBeVisible();
	} );

	test( 'shows an informational notice on mature/brown-flagged sites', async () => {
		mockSite( site );
		mockSiteSettings( { wpcom_gifting_subscription: false } );
		mockWordadsStatus( 'mature' );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } );

		await waitFor( () => {
			expect(
				screen.getByText(
					'Gift subscriptions are not available for this site due to its content classification.'
				)
			).toBeVisible();
		} );

		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows the form when wordads status is not mature', async () => {
		mockSite( site );
		mockSiteSettings( { wpcom_gifting_subscription: false } );
		mockWordadsStatus( 'private' );

		render( <SubscriptionGiftingSettings siteSlug={ site.slug } /> );

		await screen.findByRole( 'heading', { name: 'Accept a gift subscription' } );

		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeVisible();
		expect(
			screen.queryByText(
				'Gift subscriptions are not available for this site due to its content classification.'
			)
		).not.toBeInTheDocument();
	} );
} );
