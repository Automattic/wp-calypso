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

const SHARE_URL = 'https://preview.wordpress.com/?share=abc';
const mockApi = () => nock( 'https://public-api.wordpress.com' );

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
		mockApi()
			.get( '/wpcom/v2/sites/456/preview-links' )
			.query( true )
			.reply( 200, [ { code: 'abc' } ] );
	} );

	it( 'welcomes the customer over the preview', async () => {
		render();

		expect(
			await screen.findByRole( 'dialog', { name: 'Your site is on WordPress.com' } )
		).toBeVisible();
		expect(
			screen.getByText(
				'We copied source.example.com to WordPress.com. Every page is here and works. Look around: you can choose a plan from the card in the corner whenever you’re ready.'
			)
		).toBeVisible();
		expect( await screen.findByTitle( 'Your site on WordPress.com' ) ).toHaveAttribute(
			'src',
			SHARE_URL
		);
		expect(
			screen.queryByRole( 'link', { name: /preview\.wordpress\.com/ } )
		).not.toBeInTheDocument();
	} );

	it( 'closes the welcome the same way as looking around', async () => {
		render();
		await screen.findByTitle( 'Your site on WordPress.com' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect(
			await screen.findByRole( 'region', { name: 'This is your site on WordPress.com' } )
		).toBeVisible();
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'moves the welcome to a card in the corner to look around', async () => {
		const submit = render();
		await screen.findByTitle( 'Your site on WordPress.com' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Look around' } ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'region', { name: 'This is your site on WordPress.com' } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: /preview\.wordpress\.com/ } ) ).toHaveAttribute(
			'href',
			SHARE_URL
		);
		expect(
			screen.getByText( 'Private for now. Look around, then launch it when you’re ready.' )
		).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Choose a plan' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'choose_plan' } );
	} );

	it( 'folds the card away and back', async () => {
		render();
		await screen.findByTitle( 'Your site on WordPress.com' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Look around' } ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Minimize' } ) );
		expect(
			screen.queryByRole( 'region', { name: 'This is your site on WordPress.com' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Choose a plan' } ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Your site on WordPress.com' } ) );
		expect(
			screen.getByRole( 'region', { name: 'This is your site on WordPress.com' } )
		).toBeVisible();
	} );

	it( 'offers no way to launch before looking around', async () => {
		render();
		await screen.findByTitle( 'Your site on WordPress.com' );

		expect( screen.getByRole( 'button', { name: 'Look around' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Launch site' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Choose a plan' } ) ).not.toBeInTheDocument();
	} );

	it( 'makes a share link when the preview has none, rather than showing its Coming Soon page', async () => {
		nock.cleanAll();
		mockApi().get( '/wpcom/v2/sites/456/preview-links' ).query( true ).reply( 200, [] );
		const create = mockApi()
			.post( '/wpcom/v2/sites/456/preview-links' )
			.query( true )
			.reply( 200, { code: 'new' } );
		render();

		expect( screen.getByText( 'Loading your site…' ) ).toBeVisible();
		expect( await screen.findByTitle( 'Your site on WordPress.com' ) ).toHaveAttribute(
			'src',
			'https://preview.wordpress.com/?share=new'
		);
		expect( create.isDone() ).toBe( true );
	} );
} );
