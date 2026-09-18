/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import nock from 'nock';
import StaticSiteImportBuilding from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = () => {
	const submit = jest.fn();
	renderStep(
		<StaticSiteImportBuilding
			{ ...mockStepProps( { navigation: { submit }, stepName: 'static-site-import-building' } ) }
		/>,
		{ initialEntry: '/static-site-import-building?importSessionId=abc123&siteId=42' }
	);
	return submit;
};

describe( 'StaticSiteImportBuilding', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'does not fail the move when a status request fails', async () => {
		mockApi()
			.get( '/wpcom/v2/static-site-import-session/abc123' )
			.query( true )
			.times( 4 )
			.reply( 500, { code: 'internal_server_error', message: 'Oops' } );

		const submit = render();

		await waitFor( () => expect( nock.isDone() ).toBe( true ), { timeout: 10000 } );
		expect( submit ).not.toHaveBeenCalled();
	}, 15000 );
} );
