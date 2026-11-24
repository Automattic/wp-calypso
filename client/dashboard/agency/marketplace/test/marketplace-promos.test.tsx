/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import MarketplacePromos from '../marketplace-promos';
import type { AgencyAnnouncement, AgencyAnnouncementLogo } from '@automattic/api-core';

const AGENCY_ID = 123;

const wpcomPromo = {
	id: 'wpcom-black-friday',
	type: 'announcement',
	logo: 'wordpress_com',
	eyebrow: 'WordPress.com',
	headline: 'Black Friday: 25% off WordPress.com plans',
	subtitle: 'Automattic for Agencies & WordPress.com',
	description: 'Get 25% off your first term of any new annual WordPress.com plan.',
	primaryCta: { label: 'Explore WordPress.com hosting', url: '/hosting/wpcom' },
	when: { kind: 'ends', date: '2099-12-01' },
} as AgencyAnnouncement;

const pressablePromo = {
	id: 'pressable-free-months',
	type: 'announcement',
	logo: 'pressable',
	eyebrow: 'Limited time offer',
	headline: 'Get up to 6 months of free Pressable hosting on new plans!',
	subtitle: 'Automattic for Agencies & Pressable',
	description: 'Enjoy up to 6 months free on Pressable Signature and Premium plans.',
	primaryCta: { label: 'View promo details', url: '/hosting/pressable' },
	secondaryCta: {
		label: 'See full terms',
		url: 'https://example.com/pressable-terms',
		isExternal: true,
	},
	when: { kind: 'ends', date: '2099-12-01' },
} as AgencyAnnouncement;

const jetpackPromo = {
	id: 'jetpack-yearly',
	type: 'announcement',
	logo: 'jetpack',
	eyebrow: 'Jetpack',
	headline: '25% off new yearly Jetpack subscriptions',
	subtitle: 'Automattic for Agencies & Jetpack',
	description: 'Get 25% off your first year of any new yearly Jetpack plan.',
	primaryCta: { label: 'Explore Jetpack products', url: '/marketplace/products' },
	secondaryCta: {
		label: 'See Jetpack terms',
		url: 'https://example.com/jetpack-terms',
		isExternal: true,
	},
} as AgencyAnnouncement;

const wooPromo = {
	id: 'woo-extensions',
	type: 'announcement',
	logo: 'woo',
	eyebrow: 'WooCommerce',
	headline: '30% off Woo extensions',
	subtitle: 'Automattic for Agencies & WooCommerce',
	description: 'Get 30% off any new Woo extension.',
	primaryCta: { label: 'Explore Woo extensions', url: '/marketplace/products' },
} as AgencyAnnouncement;

function mockAnnouncements( items: AgencyAnnouncement[] ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/announcements` )
		.reply( 200, items );
}

const HOSTING_LOGOS: AgencyAnnouncementLogo[] = [ 'wordpress_com', 'pressable' ];
const PRESSABLE_LOGOS: AgencyAnnouncementLogo[] = [ 'pressable' ];
const PRODUCTS_LOGOS: AgencyAnnouncementLogo[] = [ 'jetpack', 'woo' ];

describe( '<MarketplacePromos>', () => {
	test( 'shows only the promos for the page’s products, with the first one open', async () => {
		mockAnnouncements( [ jetpackPromo, wpcomPromo, pressablePromo ] );
		render(
			<MarketplacePromos agencyId={ AGENCY_ID } logos={ HOSTING_LOGOS } placement="hosting" />
		);

		expect(
			await screen.findByText( 'Get 25% off your first term of any new annual WordPress.com plan.' )
		).toBeVisible();
		expect(
			screen.getByText( 'Get up to 6 months of free Pressable hosting on new plans!' )
		).toBeVisible();
		expect(
			screen.queryByText( 'Enjoy up to 6 months free on Pressable Signature and Premium plans.' )
		).not.toBeInTheDocument();
		expect(
			screen.queryByText( '25% off new yearly Jetpack subscriptions' )
		).not.toBeInTheDocument();
	} );

	test( 'a host’s own page shows only its promo, without the primary action', async () => {
		mockAnnouncements( [ wpcomPromo, pressablePromo ] );
		render(
			<MarketplacePromos
				agencyId={ AGENCY_ID }
				logos={ PRESSABLE_LOGOS }
				placement="hosting"
				hidePrimaryCta
			/>
		);

		expect( await screen.findByRole( 'link', { name: /See full terms/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'View promo details' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByText( 'Black Friday: 25% off WordPress.com plans' )
		).not.toBeInTheDocument();
	} );

	test( 'the Hosting page keeps the primary action', async () => {
		mockAnnouncements( [ pressablePromo ] );
		render(
			<MarketplacePromos agencyId={ AGENCY_ID } logos={ HOSTING_LOGOS } placement="hosting" />
		);

		expect( await screen.findByRole( 'link', { name: 'View promo details' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /See full terms/ } ) ).toBeVisible();
	} );

	test( 'the Products page shows Jetpack and Woo promos, without their primary actions', async () => {
		mockAnnouncements( [ wpcomPromo, jetpackPromo, wooPromo ] );
		render(
			<MarketplacePromos
				agencyId={ AGENCY_ID }
				logos={ PRODUCTS_LOGOS }
				placement="products"
				hidePrimaryCta
			/>
		);

		expect(
			await screen.findByText( 'Get 25% off your first year of any new yearly Jetpack plan.' )
		).toBeVisible();
		expect( screen.getByText( '30% off Woo extensions' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /See Jetpack terms/ } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: 'Explore Jetpack products' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByText( 'Black Friday: 25% off WordPress.com plans' )
		).not.toBeInTheDocument();
	} );

	test( 'tracks opening a promo and clicking its action with the page’s placement', async () => {
		const user = userEvent.setup();
		mockAnnouncements( [ wpcomPromo, pressablePromo ] );
		const { recordTracksEvent } = render(
			<MarketplacePromos agencyId={ AGENCY_ID } logos={ HOSTING_LOGOS } placement="hosting" />
		);

		const [ row ] = await screen.findAllByRole( 'button', {
			name: /Get up to 6 months of free Pressable hosting on new\splans!/,
		} );
		await user.click( row );
		await user.click( screen.getByRole( 'link', { name: 'View promo details' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_news_item_open', {
			placement: 'hosting',
			announcement_id: 'pressable-free-months',
			announcement_type: 'announcement',
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_overview_event_cta_click',
			expect.objectContaining( {
				placement: 'hosting',
				announcement_id: 'pressable-free-months',
				cta_id: 'primary',
			} )
		);
	} );

	test( 'tracks opening a promo on the Products page with its placement', async () => {
		const user = userEvent.setup();
		mockAnnouncements( [ jetpackPromo, wooPromo ] );
		const { recordTracksEvent } = render(
			<MarketplacePromos
				agencyId={ AGENCY_ID }
				logos={ PRODUCTS_LOGOS }
				placement="products"
				hidePrimaryCta
			/>
		);

		const [ row ] = await screen.findAllByRole( 'button', { name: /30% off Woo\sextensions/ } );
		await user.click( row );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_news_item_open', {
			placement: 'products',
			announcement_id: 'woo-extensions',
			announcement_type: 'announcement',
		} );
	} );

	test( 'shows nothing when there are no promos for the page’s products', async () => {
		const scope = mockAnnouncements( [ jetpackPromo ] );
		render(
			<MarketplacePromos agencyId={ AGENCY_ID } logos={ HOSTING_LOGOS } placement="hosting" />
		);

		await vi.waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect(
			screen.queryByText( '25% off new yearly Jetpack subscriptions' )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );
