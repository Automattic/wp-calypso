/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import HasSitePurchasesSwitch from '../index';

const siteId = 1;
const props = {
	siteId,
	trueComponent: <p>True</p>,
	falseComponent: <p>False</p>,
	loadingComponent: <p>Loading</p>,
};

const mockSitePurchases = ( purchases ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases );

describe( 'HasSitePurchasesSwitch', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'should render the loading state while the purchases are being fetched', () => {
		mockSitePurchases( [] );

		renderWithProvider( <HasSitePurchasesSwitch { ...props } /> );

		expect( screen.getByText( /loading/i ) ).toBeInTheDocument();
	} );

	it( 'should render the correct component if site has purchases', async () => {
		mockSitePurchases( [ { ID: 1, blog_id: siteId } ] );

		renderWithProvider( <HasSitePurchasesSwitch { ...props } /> );

		await waitFor( () => expect( screen.getByText( /true/i ) ).toBeInTheDocument() );
	} );

	it( 'should render the correct component if site has no purchase', async () => {
		mockSitePurchases( [] );

		renderWithProvider( <HasSitePurchasesSwitch { ...props } /> );

		await waitFor( () => expect( screen.getByText( /false/i ) ).toBeInTheDocument() );
	} );
} );
