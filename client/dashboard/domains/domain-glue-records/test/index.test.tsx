/**
 * @jest-environment jsdom
 */
import { DomainGlueRecord } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainGlueRecords from '../index';

const domainName = 'example.com';

jest.mock( '../../../app/router/domains', () => ( {
	...jest.requireActual( '../../../app/router/domains' ),
	domainRoute: {
		useParams: () => ( { domainName: 'example.com' } ),
	},
} ) );

const defaultGlueRecords = [
	{
		nameserver: 'ns1',
		ip_addresses: [ '1.2.3.4' ],
	},
	{
		nameserver: 'ns2',
		ip_addresses: [ '2.3.4.5' ],
	},
];

const mockFetchDomainGlueRecordsApiRequest = ( {
	responseCode = 200,
	data = defaultGlueRecords,
}: {
	responseCode?: number;
	data?: DomainGlueRecord[];
} = {} ) => {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/domains/glue-records/${ domainName }` )
		.reply( responseCode, data );
};

test( 'renders glue records table with data', async () => {
	mockFetchDomainGlueRecordsApiRequest();

	render( <DomainGlueRecords /> );

	expect( await screen.findByRole( 'link', { name: 'Add glue record' } ) ).toBeInTheDocument();

	// Check if the table rows are rendered
	expect( await screen.findByText( 'ns1' ) ).toBeInTheDocument();
	expect( screen.getByRole( 'link', { name: 'ns1' } ) );
	expect( screen.getByText( '1.2.3.4' ) ).toBeInTheDocument();
	expect( screen.getByText( 'ns2' ) ).toBeInTheDocument();
	expect( screen.getByRole( 'link', { name: 'ns2' } ) );
	expect( screen.getByText( '2.3.4.5' ) ).toBeInTheDocument();
} );

test( 'renders empty state when no glue records exist', async () => {
	mockFetchDomainGlueRecordsApiRequest( { data: [] } );

	render( <DomainGlueRecords /> );

	expect( await screen.findByRole( 'link', { name: 'Add glue record' } ) ).toBeInTheDocument();
	expect( screen.getByText( 'No glue records found for this domain.' ) ).toBeInTheDocument();
} );

test( 'renders actions when the actions menu is clicked', async () => {
	const user = userEvent.setup();

	mockFetchDomainGlueRecordsApiRequest();

	render( <DomainGlueRecords /> );

	const actions = await screen.findAllByLabelText( 'Actions' );
	await user.click( actions[ 0 ] );

	expect( screen.getByText( 'Edit' ) ).toBeInTheDocument();
	expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
} );
