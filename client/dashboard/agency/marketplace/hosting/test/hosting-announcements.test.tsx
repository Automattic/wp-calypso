/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../../test-utils';
import HostingAnnouncements, { useHostingAnnouncements } from '../hosting-announcements';
import type { HostingSection } from '../../paths';
import type { AgencyAnnouncement } from '@automattic/api-core';

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
} as AgencyAnnouncement;

function mockAnnouncements( items: AgencyAnnouncement[] ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/announcements` )
		.reply( 200, items );
}

function HostingPage( { section }: { section?: HostingSection } ) {
	const announcements = useHostingAnnouncements( AGENCY_ID, section );
	return <HostingAnnouncements announcements={ announcements } section={ section } />;
}

describe( '<HostingAnnouncements>', () => {
	test( 'shows only the WordPress.com and Pressable promos, with the first one open', async () => {
		mockAnnouncements( [ jetpackPromo, wpcomPromo, pressablePromo ] );
		render( <HostingPage /> );

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

	test( 'a host’s own page shows only that host’s promo', async () => {
		mockAnnouncements( [ wpcomPromo, pressablePromo ] );
		render( <HostingPage section="pressable" /> );

		expect(
			await screen.findByText(
				'Enjoy up to 6 months free on Pressable Signature and Premium plans.'
			)
		).toBeVisible();
		expect(
			screen.queryByText( 'Black Friday: 25% off WordPress.com plans' )
		).not.toBeInTheDocument();
	} );

	test( 'a host’s own page leaves out the primary action, since its plans are below', async () => {
		mockAnnouncements( [ wpcomPromo, pressablePromo ] );
		render( <HostingPage section="pressable" /> );

		expect( await screen.findByRole( 'link', { name: /See full terms/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'View promo details' } ) ).not.toBeInTheDocument();
	} );

	test( 'the Hosting page keeps the primary action', async () => {
		mockAnnouncements( [ pressablePromo ] );
		render( <HostingPage /> );

		expect( await screen.findByRole( 'link', { name: 'View promo details' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /See full terms/ } ) ).toBeVisible();
	} );

	test( 'tracks opening a promo and clicking its action', async () => {
		const user = userEvent.setup();
		mockAnnouncements( [ wpcomPromo, pressablePromo ] );
		const { recordTracksEvent } = render( <HostingPage /> );

		const [ row ] = await screen.findAllByRole( 'button', {
			name: /Get up to 6 months of free Pressable hosting on new\splans!/,
		} );
		await user.click( row );
		await user.click( screen.getByRole( 'link', { name: 'View promo details' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_hosting_announcement_open', {
			announcement_id: 'pressable-free-months',
			announcement_type: 'announcement',
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_hosting_announcement_cta_click',
			expect.objectContaining( { announcement_id: 'pressable-free-months', cta_id: 'primary' } )
		);
	} );

	test( 'shows nothing when there are no hosting promos', async () => {
		const scope = mockAnnouncements( [ jetpackPromo ] );
		render( <HostingPage /> );

		await vi.waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect(
			screen.queryByText( '25% off new yearly Jetpack subscriptions' )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );
