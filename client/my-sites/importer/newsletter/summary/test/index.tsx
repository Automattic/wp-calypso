/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Summary from '../index';
import type { SiteDetails } from '@automattic/data-stores';
import type { Steps } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

const SITE_ID = 1;
const SITE_URL = 'https://example.wordpress.com';
const SITE_SLUG = 'example.wordpress.com';
const ADMIN_URL = `${ SITE_URL }/wp-admin/`;
const NEWSLETTER_URL = `${ ADMIN_URL }admin.php?page=jetpack-newsletter`;

const doneSteps = {
	content: { status: 'done', content: undefined },
	subscribers: {
		status: 'done',
		content: { is_connected_stripe: false, meta: { email_count: '3' } },
	},
	summary: { status: 'done' },
} as unknown as Steps;

function renderSummary( {
	isJetpack = false,
	jetpackVersion,
	adminUrl = ADMIN_URL,
}: {
	isJetpack?: boolean;
	jetpackVersion?: string;
	adminUrl?: string | null;
} = {} ) {
	const store = configureStore()( {
		ui: { selectedSiteId: SITE_ID },
		sites: {
			items: {
				[ SITE_ID ]: {
					ID: SITE_ID,
					URL: SITE_URL,
					jetpack: isJetpack,
					options: { admin_url: adminUrl, jetpack_version: jetpackVersion },
				},
			},
		},
	} );

	return render(
		<Provider store={ store }>
			<Summary
				selectedSite={
					{
						ID: SITE_ID,
						slug: SITE_SLUG,
						URL: SITE_URL,
						name: 'Example',
					} as SiteDetails
				}
				steps={ doneSteps }
				resetImporter={ () => {} }
				fromSite="https://example.substack.com"
				onImportExpired={ () => {} }
				showConfetti={ false }
				shouldShownConfetti={ () => {} }
			/>
		</Provider>
	);
}

const customizeHref = () =>
	screen.getByRole( 'link', { name: 'Customize your newsletter' } ).getAttribute( 'href' );
const subscribersHref = () =>
	screen.getByRole( 'link', { name: 'Manage subscribers' } ).getAttribute( 'href' );

describe( '<Summary> next steps', () => {
	it( 'asks for the settings route, since the Newsletter page opens on Subscribers', () => {
		renderSummary();

		expect( customizeHref() ).toBe( `${ NEWSLETTER_URL }&p=%2F%3Ftab%3Dsettings` );
	} );

	it( 'sends subscriber management to wp-admin on a WordPress.com site', () => {
		renderSummary();

		expect( subscribersHref() ).toBe( NEWSLETTER_URL );
	} );

	it( 'sends subscriber management to wp-admin on Jetpack 16.1 and above', () => {
		renderSummary( { isJetpack: true, jetpackVersion: '16.1' } );

		expect( subscribersHref() ).toBe( NEWSLETTER_URL );
	} );

	it( 'keeps Jetpack Cloud below 16.1, where wp-admin has no Subscribers tab yet', () => {
		renderSummary( { isJetpack: true, jetpackVersion: '16.0' } );

		expect( subscribersHref() ).toBe( `https://cloud.jetpack.com/subscribers/${ SITE_SLUG }` );
	} );

	it( 'keeps Jetpack Cloud when the Jetpack version is unknown', () => {
		renderSummary( { isJetpack: true } );

		expect( subscribersHref() ).toBe( `https://cloud.jetpack.com/subscribers/${ SITE_SLUG }` );
	} );

	it( 'falls back to the site URL when the admin URL is missing', () => {
		renderSummary( { adminUrl: null } );

		expect( customizeHref() ).toBe( `${ NEWSLETTER_URL }&p=%2F%3Ftab%3Dsettings` );
		expect( subscribersHref() ).toBe( NEWSLETTER_URL );
	} );
} );
