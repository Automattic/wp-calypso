/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainAddDNS from '../add';
import type { Domain, DnsRecord } from '@automattic/api-core';

const domainName = 'example.com';

jest.mock( '../../../app/router/domains', () => ( {
	...jest.requireActual( '../../../app/router/domains' ),
	domainRoute: {
		useParams: () => ( { domainName: 'example.com' } ),
	},
} ) );

const rootMxRecords: DnsRecord[] = [
	{ type: 'MX', name: 'example.com.', data: 'mx-a.example.net.', aux: 10, ttl: 300 },
	{ type: 'MX', name: 'example.com.', data: 'mx-b.example.net.', aux: 10, ttl: 300 },
];

function mockApi( records: DnsRecord[] = rootMxRecords ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.reply( 200, { domain: domainName, has_wpcom_nameservers: true } as Domain )
		.get( `/rest/v1.1/domains/${ domainName }/dns` )
		.reply( 200, { records } );
}

function mockUpdateDns() {
	let recordsToAdd: DnsRecord[] = [];
	const scope = nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.1/domains/${ domainName }/dns`, ( body ) => {
			recordsToAdd = JSON.parse( body.dns ).records_to_add;
			return true;
		} )
		.reply( 200, { success: true, records: [] } );
	return { scope, getRecordsToAdd: () => recordsToAdd };
}

async function selectType( type: string ) {
	await userEvent.selectOptions( await screen.findByRole( 'combobox', { name: 'Type' } ), type );
	await screen.findByRole( 'spinbutton', { name: /TTL/ } );
}

const getTtlInput = () => screen.getByRole( 'spinbutton', { name: /TTL/ } );
const getNameInput = () => screen.getByRole( 'textbox', { name: /Name/ } );

describe( '<DomainAddDNS>', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'pre-fills the TTL of the existing records with the same name and type', async () => {
		mockApi();
		render( <DomainAddDNS /> );

		await selectType( 'MX' );

		expect( getTtlInput() ).toHaveValue( 300 );
	} );

	test( 'uses the default TTL when no existing record has the same name and type', async () => {
		const user = userEvent.setup();
		mockApi();
		render( <DomainAddDNS /> );

		await selectType( 'MX' );
		await user.type( getNameInput(), 'mail' );

		expect( getTtlInput() ).toHaveValue( 3600 );
	} );

	test( 'keeps a TTL the user typed when the name changes', async () => {
		const user = userEvent.setup();
		mockApi();
		render( <DomainAddDNS /> );

		await selectType( 'MX' );
		await user.clear( getTtlInput() );
		await user.type( getTtlInput(), '900' );
		await user.type( getNameInput(), 'mail' );

		expect( getTtlInput() ).toHaveValue( 900 );
	} );

	test( 'sends the pre-filled TTL when adding a record', async () => {
		const user = userEvent.setup();
		mockApi();
		const { scope, getRecordsToAdd } = mockUpdateDns();
		render( <DomainAddDNS /> );

		await selectType( 'MX' );
		await user.type( screen.getByRole( 'textbox', { name: 'Handled by' } ), 'mx-c.example.net' );
		await user.click( screen.getByRole( 'button', { name: 'Add DNS record' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( getRecordsToAdd() ).toEqual( [ expect.objectContaining( { type: 'MX', ttl: 300 } ) ] );
	} );

	test( 'does not add a record with a TTL of 0', async () => {
		const user = userEvent.setup();
		mockApi();
		const { scope } = mockUpdateDns();
		render( <DomainAddDNS /> );

		await selectType( 'MX' );
		await user.type( screen.getByRole( 'textbox', { name: 'Handled by' } ), 'mx-c.example.net' );
		await user.clear( getTtlInput() );
		await user.type( getTtlInput(), '0' );
		await user.click( screen.getByRole( 'button', { name: 'Add DNS record' } ) );

		expect(
			await screen.findByText( 'Please enter a TTL value between 300 and 86400.' )
		).toBeVisible();
		expect( scope.isDone() ).toBe( false );
	} );

	test( 'adds a root MX record after an invalid name was cleared under another type', async () => {
		const user = userEvent.setup();
		mockApi();
		const { scope } = mockUpdateDns();
		render( <DomainAddDNS /> );

		await selectType( 'CNAME' );
		await user.type( getNameInput(), 'a' );
		await user.clear( getNameInput() );
		await selectType( 'MX' );
		await user.type( screen.getByRole( 'textbox', { name: 'Handled by' } ), 'mx-c.example.net' );
		await user.click( screen.getByRole( 'button', { name: 'Add DNS record' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'adds a TXT record whose name starts with an underscore', async () => {
		const user = userEvent.setup();
		mockApi();
		const { scope, getRecordsToAdd } = mockUpdateDns();
		render( <DomainAddDNS /> );

		await selectType( 'TXT' );
		await user.type( getNameInput(), '_dmarc' );
		await user.type( screen.getByRole( 'textbox', { name: /Text/ } ), 'v=DMARC1; p=none' );
		await user.click( screen.getByRole( 'button', { name: 'Add DNS record' } ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( getRecordsToAdd() ).toEqual( [
			expect.objectContaining( { type: 'TXT', name: '_dmarc' } ),
		] );
	} );
} );
