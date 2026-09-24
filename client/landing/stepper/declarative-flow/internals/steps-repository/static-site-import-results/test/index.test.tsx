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

	const mockSession = ( preview_summary: object ) =>
		mockApi().get( '/wpcom/v2/static-site-import-session/abc123' ).query( true ).reply( 200, {
			session_id: 'abc123',
			status: 'new',
			state: 'preview_ready',
			source_digest: 'digest',
			preview_summary,
			site_url: '',
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
		expect( screen.getByText( 'High confidence. Everything can come with you.' ) ).toBeVisible();
		expect( screen.getByText( '12 pages' ) ).toBeVisible();

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
			screen.getByText( 'Good confidence. 1 thing to set up after the move.' )
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
