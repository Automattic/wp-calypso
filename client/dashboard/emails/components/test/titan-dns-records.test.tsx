/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import TitanDnsRecords from '../titan-dns-records';

const DOMAIN = 'example.com';
const DKIM_RECORD = {
	name: 'titan1._domainkey.example.com',
	type: 'TXT',
	data: 'v=DKIM1; k=rsa; p=...',
};
const LOADING = 'Loading the DKIM record.';
const UNAVAILABLE = 'We couldn’t load the DKIM record. Try again later.';
const MX_AND_SPF = [ 'mx1.titan.email', 'mx2.titan.email', 'v=spf1 include:spf.titan.email ~all' ];

const fieldValues = ( name: 'Name' | 'Value' ) =>
	screen
		.getAllByRole( 'textbox', { name } )
		.map( ( input ) => ( input as HTMLInputElement ).value );

function mockDomain( hasWpcomNameservers: boolean ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ DOMAIN }` )
		.query( true )
		.reply( 200, {
			domain: DOMAIN,
			has_wpcom_nameservers: hasWpcomNameservers,
			titan_mail_subscription: { order_id: 4242 },
		} );
}

function mockDkimRecord( status: number, body: nock.Body ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/emails/titan/${ DOMAIN }/dkim-record` )
		.reply( status, body );
}

const renderRecords = () => {
	mockDomain( false );
	return render( <TitanDnsRecords domain={ DOMAIN } /> );
};

describe( '<TitanDnsRecords>', () => {
	test( 'shows the DKIM record next to the MX and SPF records', async () => {
		mockDkimRecord( 200, DKIM_RECORD );
		renderRecords();

		expect( await screen.findByText( /add these MX, SPF and DKIM records/ ) ).toBeVisible();
		await waitFor( () =>
			expect( fieldValues( 'Value' ) ).toEqual( [ ...MX_AND_SPF, DKIM_RECORD.data ] )
		);
		expect( fieldValues( 'Name' ) ).toContain( DKIM_RECORD.name );
		expect( screen.getByText( 'DKIM' ) ).toBeVisible();
	} );

	test( 'shows a loading message until the DKIM record arrives', async () => {
		let release = () => {};
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/emails/titan/${ DOMAIN }/dkim-record` )
			.reply( ( _uri, _body, callback ) => {
				release = () => callback( null, [ 200, DKIM_RECORD ] );
			} );
		renderRecords();

		expect( await screen.findByText( LOADING ) ).toBeVisible();
		expect( fieldValues( 'Value' ) ).toEqual( expect.arrayContaining( MX_AND_SPF ) );

		release();

		await waitFor( () => expect( fieldValues( 'Value' ) ).toContain( DKIM_RECORD.data ) );
		expect( screen.queryByText( LOADING ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the MX and SPF records when Titan refuses the DKIM record', async () => {
		mockDkimRecord( 502, { code: 'titan_error', message: 'Titan refused to issue the record.' } );
		renderRecords();

		expect( await screen.findByText( UNAVAILABLE ) ).toBeVisible();
		expect( fieldValues( 'Value' ) ).toEqual( expect.arrayContaining( MX_AND_SPF ) );
	} );

	test.each( [ 401, 403 ] )( 'hides the DKIM record on a %d', async ( status ) => {
		const scope = mockDkimRecord( status, { code: 'forbidden', message: 'Forbidden' } );
		renderRecords();

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( screen.queryByText( LOADING ) ).not.toBeInTheDocument() );
		expect( fieldValues( 'Value' ) ).toEqual( MX_AND_SPF );
		expect( screen.queryByText( 'DKIM' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( UNAVAILABLE ) ).not.toBeInTheDocument();
	} );

	test( 'skips the records and the DKIM request for domains on WordPress.com name servers', async () => {
		mockDomain( true );
		const dkimScope = mockDkimRecord( 200, DKIM_RECORD );
		render( <TitanDnsRecords domain={ DOMAIN } /> );

		expect(
			await screen.findByText(
				'Your domain uses WordPress.com name servers, so the email DNS records are already set up for you.'
			)
		).toBeVisible();
		expect( screen.queryByRole( 'textbox' ) ).not.toBeInTheDocument();
		expect( dkimScope.isDone() ).toBe( false );
	} );
} );
