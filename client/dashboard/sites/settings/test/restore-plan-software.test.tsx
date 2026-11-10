/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { useState } from 'react';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import SiteActions from '../site-actions';
import type { Site } from '@automattic/api-core';

const site = { ID: 123, is_wpcom_atomic: true } as Site;
const confirmation =
	'Restoration requested. The plugins and themes included with your plan should be restored within a few minutes.';

function RestorationActions( { selectedSite = site }: { selectedSite?: Site } ) {
	return (
		<>
			<SiteActions site={ selectedSite } />
			<Snackbars />
		</>
	);
}

describe( 'Plan software restoration feedback', () => {
	beforeEach( () => {
		jest.spyOn( window, 'scrollTo' ).mockImplementation( () => {} );
		dispatch( noticesStore ).removeNotices(
			select( noticesStore )
				.getNotices()
				.map( ( notice ) => notice.id )
		);
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'blocks repeated requests while pending and after acceptance, showing one confirmation', async () => {
		let releaseResponse = () => {};
		const response = new Promise< void >( ( resolve ) => {
			releaseResponse = resolve;
		} );
		const restore = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/hosting/restore-plan-software' )
			.reply( 200, async () => {
				await response;
				return {};
			} );
		const duplicate = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/hosting/restore-plan-software' )
			.reply( 200, {} );
		const user = userEvent.setup();
		render( <RestorationActions /> );
		const button = await screen.findByRole( 'button', { name: 'Restore' } );
		expect( button ).toBeEnabled();

		try {
			await user.dblClick( button );
			expect( screen.getByRole( 'button', { name: 'Requesting…' } ) ).toBeDisabled();
			expect(
				screen.queryByText( confirmation, { selector: '.components-snackbar__content' } )
			).not.toBeInTheDocument();
			await user.click( button );
		} finally {
			await act( async () => releaseResponse() );
		}
		expect( await screen.findByRole( 'button', { name: 'Requested' } ) ).toBeDisabled();
		await waitFor( () =>
			expect(
				screen.getByText( confirmation, { selector: '.components-snackbar__content' } )
			).toBeVisible()
		);
		await user.click( button );

		expect( restore.isDone() ).toBe( true );
		expect( duplicate.isDone() ).toBe( false );
		expect(
			screen.getAllByText( confirmation, { selector: '.components-snackbar__content' } )
		).toHaveLength( 1 );
	} );

	it( 'allows a failed request to be retried with the keyboard', async () => {
		const failure = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/hosting/restore-plan-software' )
			.reply( 500, { error: 'restore_failed', message: 'Unable to restore.' } );
		const retry = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/hosting/restore-plan-software' )
			.reply( 200, {} );
		const user = userEvent.setup();
		render( <RestorationActions /> );
		await user.click( await screen.findByRole( 'button', { name: 'Restore' } ) );
		await waitFor( () =>
			expect(
				screen.getByText( 'Failed to request restoration of plan plugin and themes.', {
					selector: '.components-snackbar__content',
				} )
			).toBeVisible()
		);
		const button = screen.getByRole( 'button', { name: 'Restore' } );
		expect( button ).toBeEnabled();
		button.focus();
		await user.keyboard( '{Enter}' );
		expect( await screen.findByRole( 'button', { name: 'Requested' } ) ).toBeDisabled();
		await waitFor( () =>
			expect(
				screen.getByText( confirmation, { selector: '.components-snackbar__content' } )
			).toBeVisible()
		);
		expect( failure.isDone() ).toBe( true );
		expect( retry.isDone() ).toBe( true );
	} );

	it( 'starts with an enabled Restore button when Settings is reopened', async () => {
		const restore = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/hosting/restore-plan-software' )
			.reply( 200, {} );
		const user = userEvent.setup();
		const firstVisit = render( <RestorationActions /> );
		await user.click( await screen.findByRole( 'button', { name: 'Restore' } ) );
		await screen.findByRole( 'button', { name: 'Requested' } );
		firstVisit.unmount();
		render( <RestorationActions /> );
		expect( await screen.findByRole( 'button', { name: 'Restore' } ) ).toBeEnabled();
		expect( restore.isDone() ).toBe( true );
	} );

	it( 'resets the accepted state when switching to a different site', async () => {
		function SiteSwitcher() {
			const [ selectedSite, setSelectedSite ] = useState( site );
			return (
				<>
					<button onClick={ () => setSelectedSite( { ...site, ID: 456 } ) }>Switch site</button>
					<RestorationActions selectedSite={ selectedSite } />
				</>
			);
		}
		const first = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/hosting/restore-plan-software' )
			.reply( 200, {} );
		const second = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/456/hosting/restore-plan-software' )
			.reply( 200, {} );
		const user = userEvent.setup();
		render( <SiteSwitcher /> );
		await user.click( await screen.findByRole( 'button', { name: 'Restore' } ) );
		await screen.findByRole( 'button', { name: 'Requested' } );
		await user.click( screen.getByRole( 'button', { name: 'Switch site' } ) );
		const button = screen.getByRole( 'button', { name: 'Restore' } );
		expect( button ).toBeEnabled();
		await user.click( button );
		await waitFor( () => expect( second.isDone() ).toBe( true ) );
		expect( first.isDone() ).toBe( true );
	} );

	it.each( [
		[ 'Simple', { ...site, is_wpcom_atomic: false } ],
		[ 'staging', { ...site, is_wpcom_staging_site: true } ],
	] )( 'does not expose restoration on a %s site', async ( _, selectedSite ) => {
		render(
			<>
				<p>Settings loaded</p>
				<RestorationActions selectedSite={ selectedSite } />
			</>
		);
		await screen.findByText( 'Settings loaded' );
		expect( screen.queryByRole( 'button', { name: 'Restore' } ) ).not.toBeInTheDocument();
	} );
} );
