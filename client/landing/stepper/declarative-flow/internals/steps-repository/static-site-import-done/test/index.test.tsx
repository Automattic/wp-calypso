/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import StaticSiteImportDone from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteId: 42, siteSlug: 'busybears.wordpress.com' } ),
} ) );

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = ( domainChoice = 'keep' ) => {
	const submit = jest.fn();
	renderStep(
		<StaticSiteImportDone
			{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-done' } ) }
		/>,
		{
			initialEntry: `/static-site-import-done?from=busybearscleaning.com&importSessionId=abc123&domainChoice=${ domainChoice }`,
		}
	);
	return submit;
};

describe( 'StaticSiteImportDone', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
		mockApi().get( '/wpcom/v2/static-site-import-session/abc123' ).query( true ).reply( 200, {
			session_id: 'abc123',
			status: 'finished',
			state: 'finished',
			source_digest: 'digest',
			preview_summary: [],
			site_url: 'https://busybears.wordpress.com/',
		} );
	} );

	it( 'links to the private preview', async () => {
		render();

		const link = await screen.findByRole( 'link', { name: /Preview your new site/ } );
		await waitFor( () =>
			expect( link ).toHaveAttribute( 'href', 'https://busybears.wordpress.com/' )
		);
		expect(
			screen.getByText( 'busybearscleaning.com has been rebuilt on WordPress.com.' )
		).toBeVisible();
	} );

	it( 'connects the kept domain', async () => {
		const submit = render();

		await userEvent.click(
			screen.getByRole( 'button', { name: 'Connect busybearscleaning.com' } )
		);

		expect( submit ).toHaveBeenCalledWith( { action: 'connect-domain' } );
	} );

	it( 'goes to the site when the domain was not kept', async () => {
		const submit = render( 'free' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Go to my site' } ) );

		expect( submit ).toHaveBeenCalledWith( { action: 'go-to-site' } );
	} );

	it( 'sends what looks off to the migrations team', async () => {
		let ticket: Record< string, unknown > = {};
		mockApi()
			.post( '/wpcom/v2/help/migration-ticket/new', ( body ) => {
				ticket = body;
				return true;
			} )
			.query( true )
			.reply( 200, { success: true } );

		const submit = render();

		await userEvent.click( screen.getByRole( 'button', { name: 'Something’s off' } ) );
		await userEvent.type(
			screen.getByLabelText( 'What doesn’t look right?' ),
			'The photos are in the wrong order.'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Get help with this' } ) );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'reported' } ) );
		expect( ticket ).toMatchObject( {
			blog_url: 'busybears.wordpress.com',
			from_url: 'https://busybearscleaning.com',
		} );
		expect( ticket.context ).toContain( 'The photos are in the wrong order.' );
	} );
} );
