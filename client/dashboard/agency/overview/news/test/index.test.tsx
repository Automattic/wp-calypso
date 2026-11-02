/**
 * @jest-environment jsdom
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import NewsCard from '../index';
import type { AgencyAnnouncement } from '@automattic/api-core';

const AGENCY_ID = 123;

const event = {
	id: '1',
	type: 'event',
	logo: 'automattic',
	eyebrow: 'Webinar',
	headline: 'Run an AI visibility audit',
	subtitle: 'Automattic for Agencies',
	description: 'Watch an audit run start to finish.\n\nThen scope the project.',
	primaryCta: { label: 'Save your spot', url: 'https://example.com/register', isExternal: true },
	when: { kind: 'event', date: '2099-11-05T15:00:00Z' },
} as AgencyAnnouncement;

const announcement = {
	id: '2',
	type: 'announcement',
	logo: 'pressable',
	eyebrow: 'Limited time offer',
	headline: 'Free Pressable hosting',
	subtitle: 'Automattic for Agencies & Pressable',
	description: 'Choose annual billing for 6 months free.',
	primaryCta: { label: 'View promo details', url: '/hosting/pressable' },
} as AgencyAnnouncement;

function mockAnnouncements( items: AgencyAnnouncement[] ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/announcements` )
		.reply( 200, items );
}

describe( '<NewsCard>', () => {
	test( 'opens the first item, with each paragraph of its description', async () => {
		mockAnnouncements( [ event, announcement ] );
		render( <NewsCard agencyId={ AGENCY_ID } /> );

		expect( await screen.findByText( 'Watch an audit run start to finish.' ) ).toBeVisible();
		expect( screen.getByText( 'Then scope the project.' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Save your spot/ } ) ).toBeVisible();
		expect(
			screen.queryByText( 'Choose annual billing for 6 months free.' )
		).not.toBeInTheDocument();
	} );

	test( 'closes the item that opens by default', async () => {
		const user = userEvent.setup();
		mockAnnouncements( [ event, announcement ] );
		render( <NewsCard agencyId={ AGENCY_ID } /> );

		const [ row ] = await screen.findAllByRole( 'button', { name: /Run an AI visibility\saudit/ } );
		await user.click( row );

		expect( screen.queryByText( 'Watch an audit run start to finish.' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByText( 'Choose annual billing for 6 months free.' )
		).not.toBeInTheDocument();
	} );

	test( 'filters the list by type', async () => {
		const user = userEvent.setup();
		const recordTracksEvent = jest.fn();
		mockAnnouncements( [ event, announcement ] );
		render( <NewsCard agencyId={ AGENCY_ID } recordTracksEvent={ recordTracksEvent } /> );

		const filters = await screen.findByRole( 'group', { name: 'Show' } );
		await user.click( within( filters ).getByRole( 'button', { name: /Announcements/ } ) );

		expect( screen.getByText( 'Free Pressable hosting' ) ).toBeVisible();
		expect( screen.queryByText( 'Run an AI visibility audit' ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_news_filter_click', {
			filter: 'announcement',
		} );
	} );

	test( 'picking the selected filter again goes back to All', async () => {
		const user = userEvent.setup();
		mockAnnouncements( [ event, announcement ] );
		render( <NewsCard agencyId={ AGENCY_ID } /> );

		const filters = await screen.findByRole( 'group', { name: 'Show' } );
		const all = within( filters ).getByRole( 'button', { name: /All/ } );
		const announcements = within( filters ).getByRole( 'button', { name: /Announcements/ } );

		await user.click( announcements );
		expect( announcements ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( all ).toHaveAttribute( 'aria-pressed', 'false' );

		await user.click( announcements );
		expect( all ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByText( 'Run an AI visibility audit' ) ).toBeVisible();
	} );

	test( 'tracks opening an item and clicking its action', async () => {
		const user = userEvent.setup();
		const recordTracksEvent = jest.fn();
		mockAnnouncements( [ event, announcement ] );
		render(
			<NewsCard
				agencyId={ AGENCY_ID }
				recordTracksEvent={ recordTracksEvent }
				shouldUseRouterLink={ false }
			/>
		);

		// The row and its chevron are both toggles named after the headline; click the row.
		const [ row ] = await screen.findAllByRole( 'button', { name: /Free Pressable\shosting/ } );
		await user.click( row );
		await user.click( screen.getByRole( 'link', { name: 'View promo details' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_news_item_open', {
			announcement_id: '2',
			announcement_type: 'announcement',
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_overview_news_cta_click', {
			announcement_id: '2',
			announcement_type: 'announcement',
			cta_id: 'primary',
		} );
	} );

	test( 'shows nothing when there are no announcements', async () => {
		const scope = mockAnnouncements( [] );
		render( <NewsCard agencyId={ AGENCY_ID } /> );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( screen.queryByText( 'News and updates' ) ).not.toBeInTheDocument();
	} );
} );
