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

	it( 'continues once the preview is ready', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.reply( 200, {
				session_id: 'abc123',
				status: 'new',
				state: 'preview_ready',
				source_digest: 'digest',
				preview_summary: { pages: 12 },
				site_url: '',
			} );

		const submit = render();

		const button = screen.getByRole( 'button', { name: 'Continue' } );
		expect( button ).toBeDisabled();
		await waitFor( () => expect( button ).toBeEnabled() );
		expect( screen.getByText( '12 pages' ) ).toBeVisible();

		await userEvent.click( button );
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
