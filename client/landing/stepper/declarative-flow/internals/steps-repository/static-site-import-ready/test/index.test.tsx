/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import documentHeadReducer from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StaticSiteImportReadyStep from '..';
import { mockStepProps } from '../../test/helpers';

// The preview itself is an iframe onto the site, which a test can't load.
jest.mock( '../../../components/site-preview', () => ( {
	__esModule: true,
	default: ( { url, siteSlug }: { url?: string; siteSlug: string | null } ) => (
		<iframe
			title="Site preview"
			src={ url ?? ( siteSlug ? `https://${ siteSlug }` : undefined ) }
		/>
	),
} ) );

const SHARE_URL = 'https://preview.wpcomstaging.com/?share=abc';

const render = () => {
	const submit = jest.fn();
	renderWithProvider(
		<MemoryRouter>
			<StaticSiteImportReadyStep
				{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-ready' } ) }
				siteId={ 456 }
				siteSlug="preview.wordpress.com"
				from="https://source.example.com"
			/>
		</MemoryRouter>,
		{ reducers: { documentHead: documentHeadReducer, ui: uiReducer } }
	);
	return submit;
};

describe( 'StaticSiteImportReadyStep', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
		jest.clearAllMocks();
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/wow-funnel/pending' )
			.query( true )
			.reply( 200, {
				pending: false,
				preview_sites: [
					{
						blog_id: 456,
						site_slug: 'preview.wordpress.com',
						share_url: SHARE_URL,
					},
				],
			} );
	} );

	it( 'shows where the site was copied from and to, over the preview', async () => {
		render();

		expect(
			await screen.findByRole( 'dialog', { name: 'Your site is on WordPress.com' } )
		).toBeVisible();
		expect(
			screen.getByText(
				'We copied source.example.com onto a private preview. Click around: every page is here and works. Launch it when you’re happy.'
			)
		).toBeVisible();
		expect(
			await screen.findByRole( 'link', { name: /preview\.wpcomstaging\.com/ } )
		).toHaveAttribute( 'href', SHARE_URL );
		expect( screen.getByTitle( 'Site preview' ) ).toHaveAttribute( 'src', SHARE_URL );
	} );

	it( 'moves the welcome to a card in the corner to look around', async () => {
		const submit = render();
		await screen.findByRole( 'link', { name: /preview\.wpcomstaging\.com/ } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Look around' } ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'region', { name: 'This is your site on WordPress.com' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Private for now. Look around, then launch it when you’re ready.' )
		).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Launch site' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'launch' } );
	} );

	it( 'folds the card away and back', async () => {
		render();
		await screen.findByRole( 'link', { name: /preview\.wpcomstaging\.com/ } );
		await userEvent.click( screen.getByRole( 'button', { name: 'Look around' } ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Minimize' } ) );
		expect(
			screen.queryByRole( 'region', { name: 'This is your site on WordPress.com' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Launch site' } ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Your site on WordPress.com' } ) );
		expect(
			screen.getByRole( 'region', { name: 'This is your site on WordPress.com' } )
		).toBeVisible();
	} );

	it( 'asks to launch the site', async () => {
		const submit = render();
		await screen.findByRole( 'link', { name: /preview\.wpcomstaging\.com/ } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Launch site' } ) );

		expect( submit ).toHaveBeenCalledWith( { action: 'launch' } );
	} );

	it( 'waits for the share link rather than showing the preview’s Coming Soon page', async () => {
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/wow-funnel/pending' )
			.query( true )
			.reply( 200, {
				pending: false,
				preview_sites: [ { blog_id: 456, site_slug: 'preview.wordpress.com' } ],
			} );
		render();

		expect(
			await screen.findByRole( 'dialog', { name: 'Your site is on WordPress.com' } )
		).toBeVisible();
		expect( screen.getByTitle( 'Site preview' ) ).not.toHaveAttribute( 'src' );
	} );
} );
