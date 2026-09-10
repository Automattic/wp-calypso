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
const ADMIN_URL = 'https://example.wordpress.com/wp-admin/';

const doneSteps = {
	content: { status: 'done', content: undefined },
	subscribers: {
		status: 'done',
		content: { is_connected_stripe: false, meta: { email_count: '3' } },
	},
	summary: { status: 'done' },
} as unknown as Steps;

function renderSummary( { isJetpack = false }: { isJetpack?: boolean } = {} ) {
	const store = configureStore()( {
		ui: { selectedSiteId: SITE_ID },
		sites: {
			items: {
				[ SITE_ID ]: {
					ID: SITE_ID,
					URL: 'https://example.wordpress.com',
					jetpack: isJetpack,
					options: { admin_url: ADMIN_URL },
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
						slug: 'example.wordpress.com',
						URL: 'https://example.wordpress.com',
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

describe( '<Summary> next steps', () => {
	it( 'asks for the settings tab, since the Newsletter page opens on Subscribers', () => {
		renderSummary();

		expect( screen.getByRole( 'link', { name: 'Customize your newsletter' } ) ).toHaveAttribute(
			'href',
			`${ ADMIN_URL }admin.php?page=jetpack-newsletter&tab=settings`
		);
	} );

	it( 'sends subscriber management to wp-admin on a WordPress.com site', () => {
		renderSummary();

		expect( screen.getByRole( 'link', { name: 'Manage subscribers' } ) ).toHaveAttribute(
			'href',
			`${ ADMIN_URL }admin.php?page=jetpack-newsletter`
		);
	} );

	it( 'keeps Jetpack sites on Jetpack Cloud, which does not depend on the wp-admin page', () => {
		renderSummary( { isJetpack: true } );

		expect( screen.getByRole( 'link', { name: 'Manage subscribers' } ) ).toHaveAttribute(
			'href',
			'https://cloud.jetpack.com/subscribers/example.wordpress.com'
		);
	} );
} );
