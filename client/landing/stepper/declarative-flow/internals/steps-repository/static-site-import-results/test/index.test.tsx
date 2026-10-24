/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import StaticSiteImportResults from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = () => {
	const submit = jest.fn();
	renderStep(
		<StaticSiteImportResults
			{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-results' } ) }
		/>,
		{
			initialEntry: '/static-site-import-results?from=busybearscleaning.com&importSessionId=abc123',
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
		}
	);
	return submit;
};

describe( 'StaticSiteImportResults', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
	} );

	const mockSession = ( preview_summary: object, fields: object = {} ) =>
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, {
				session_id: 'abc123',
				status: 'new',
				state: 'preview_ready',
				source_digest: 'digest',
				preview_summary,
				site_url: '',
				...fields,
			} );

	it( 'shows the captured homepage only when the session has a preview image', async () => {
		mockSession(
			{ pages: 12, quality_pass: true },
			{ preview_image_url: 'https://public-api.wordpress.com/preview.png' }
		);

		render();

		expect(
			await screen.findByRole( 'img', { name: 'The homepage of busybearscleaning.com' } )
		).toHaveAttribute( 'src', 'https://public-api.wordpress.com/preview.png' );
	} );

	it( 'moves the whole site when everything can come across', async () => {
		mockSession( {
			pages: 12,
			quality_pass: true,
			inspection: { measured: true, confidence: 'bounded-sample', capabilities: {} },
		} );

		const submit = render();

		const button = screen.getByRole( 'button', { name: 'Move my site' } );
		expect( button ).toBeDisabled();
		await waitFor( () => expect( button ).toBeEnabled() );
		expect( screen.getByRole( 'heading', { name: 'We can move your site' } ) ).toBeVisible();
		expect(
			screen.getByText( 'High confidence. Everything can come with you.', {
				selector: '.components-notice__content > span',
			} )
		).toBeVisible();
		expect( screen.getByText( '12 pages' ) ).toBeVisible();
		expect( screen.queryByRole( 'img', { name: /The homepage of/ } ) ).not.toBeInTheDocument();

		await userEvent.click( button );
		expect( submit ).toHaveBeenCalledWith( { action: 'continue' } );
	} );

	it( 'lists what has to be set up after the move', async () => {
		mockSession( {
			pages: 12,
			quality_pass: true,
			inspection: { measured: true, confidence: 'bounded-sample', capabilities: { forms: 1 } },
		} );

		render();

		expect(
			await screen.findByRole( 'heading', { name: 'We can move almost all of your site' } )
		).toBeVisible();
		expect(
			screen.getByText( 'Good confidence. 1 thing to set up after the move.', {
				selector: '.components-notice__content > span',
			} )
		).toBeVisible();
		expect( screen.getByText( 'Your contact form' ) ).toBeVisible();
	} );

	it( 'offers an expert when the store can’t be moved', async () => {
		mockSession( {
			pages: 12,
			quality_pass: true,
			inspection: { measured: true, confidence: 'bounded-sample', capabilities: { commerce: 2 } },
		} );

		const submit = render();

		expect(
			await screen.findByRole( 'heading', {
				name: 'Some parts of your site can’t be moved automatically',
			} )
		).toBeVisible();
		expect( screen.getByText( 'Your online store' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Talk to a migration expert' } ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue without these items' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'continue' } );
	} );

	it( 'asks for an expert as a non-WordPress migration', async () => {
		mockSession( {
			pages: 12,
			quality_pass: true,
			inspection: { measured: true, confidence: 'bounded-sample', capabilities: { commerce: 2 } },
		} );
		let ticket: Record< string, unknown > = {};
		const ticketRequest = mockApi()
			.post( '/wpcom/v2/help/migration-ticket/new', ( body ) => {
				ticket = body;
				return true;
			} )
			.reply( 200, { success: true } );

		const submit = render();

		await userEvent.click(
			await screen.findByRole( 'button', { name: 'Talk to a migration expert' } )
		);

		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { action: 'expert' } ) );
		expect( ticketRequest.isDone() ).toBe( true );
		expect( ticket ).toMatchObject( {
			from_url: 'https://busybearscleaning.com',
			context: 'site_is_not_wordpress',
		} );
	} );

	it( 'offers to read the site again when the session is gone', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 404, { code: 'static_site_import_session_not_found', message: 'Gone' } );

		const submit = render();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Read my site again' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'restart' } );
	} );
} );
