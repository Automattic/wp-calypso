/**
 * @jest-environment jsdom
 */
import { DomainMappingSetupInfo, DomainMappingStatus } from '@automattic/api-core';
import { screen, within } from '@testing-library/react';
import { render } from '../../../test-utils';
import DNSRecordsDataView from '../dns-records-dataview';

const createMockDomainMappingStatus = (
	hostIpAddresses: string[],
	wwwCnameRecordTarget: string | null = null
): DomainMappingStatus => ( {
	has_mapping_records: false,
	has_wpcom_nameservers: false,
	has_wpcom_ip_addresses: false,
	has_cloudflare_ip_addresses: false,
	has_mx_records: false,
	www_cname_record_target: wwwCnameRecordTarget,
	resolves_to_wpcom: false,
	host_ip_addresses: hostIpAddresses,
	name_servers: [],
	mode: 'advanced',
} );

const createMockDomainConnectionSetupInfo = (): DomainMappingSetupInfo => ( {
	connection_mode: null,
	domain_connect_apply_wpcom_hosting: null,
	domain_connect_provider_id: null,
	default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
	wpcom_name_servers: [],
	is_subdomain: false,
	root_domain: 'example.com',
} );

describe( 'DNSRecordsDataView', () => {
	test( 'renders A records when current IPs match target IPs exactly', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ '192.0.78.24', '192.0.78.25' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A record rows + 1 CNAME row
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: A @ 192.0.78.24 -> 192.0.78.24 (MATCHED!)
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 1 ] ).getByText( '@' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( '192.0.78.24' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 4 ] ).getByText( '192.0.78.24' ) ).toBeInTheDocument();

		// Row 2: A @ 192.0.78.25 -> 192.0.78.25 (MATCHED!)
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 1 ] ).getByText( '@' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( '192.0.78.25' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 4 ] ).getByText( '192.0.78.25' ) ).toBeInTheDocument();

		// Row 3: CNAME www BLANK -> www.example.com (no current CNAME)
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 1 ] ).getByText( 'www' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
	} );

	test( 'renders A records with BLANK when only 1 current IP exists', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ '185.230.63.171' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A record rows + 1 CNAME row
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: A @ 185.230.63.171 -> 192.0.78.24
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 1 ] ).getByText( '@' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( '185.230.63.171' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 4 ] ).getByText( '192.0.78.24' ) ).toBeInTheDocument();

		// Row 2: A @ BLANK -> 192.0.78.25
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 1 ] ).getByText( '@' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 4 ] ).getByText( '192.0.78.25' ) ).toBeInTheDocument();

		// Row 3: CNAME www BLANK -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
	} );

	test( 'renders A records when current IPs are different from targets', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [
			'185.230.63.171',
			'185.230.63.186',
		] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A record rows + 1 CNAME row
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: A @ 185.230.63.171 -> 192.0.78.24
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( '185.230.63.171' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 4 ] ).getByText( '192.0.78.24' ) ).toBeInTheDocument();

		// Row 2: A @ 185.230.63.186 -> 192.0.78.25
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( '185.230.63.186' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 4 ] ).getByText( '192.0.78.25' ) ).toBeInTheDocument();

		// Row 3: CNAME www BLANK -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
	} );

	test( 'renders CNAME record with A records', async () => {
		const domainMappingStatus = createMockDomainMappingStatus(
			[ '192.0.78.24', '192.0.78.25' ],
			'initial.winxdns.net'
		);
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A records + 1 CNAME record
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: A @ 192.0.78.24 -> 192.0.78.24
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();

		// Row 2: A @ 192.0.78.25 -> 192.0.78.25
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();

		// Row 3: CNAME www initial.winxdns.net -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 1 ] ).getByText( 'www' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'initial.winxdns.net' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 4 ] ).getByText( 'example.com' ) ).toBeInTheDocument();
	} );

	test( 'renders CNAME record when it matches the target', async () => {
		const domainMappingStatus = createMockDomainMappingStatus(
			[ '192.0.78.24', '192.0.78.25' ],
			'example.com'
		);
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A records + 1 CNAME record
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 3: CNAME www example.com -> example.com (MATCHED!)
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 1 ] ).getByText( 'www' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'example.com' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 4 ] ).getByText( 'example.com' ) ).toBeInTheDocument();
	} );

	test( 'renders column headers correctly', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ '192.0.78.24' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Check for column headers
		expect( await screen.findByText( 'Type' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Name' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Current values' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Update to' ) ).toBeInTheDocument();
	} );

	test( 'handles empty current IP addresses array', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A record rows + 1 CNAME row
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: A @ BLANK -> 192.0.78.24
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 4 ] ).getByText( '192.0.78.24' ) ).toBeInTheDocument();

		// Row 2: A @ BLANK -> 192.0.78.25
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 4 ] ).getByText( '192.0.78.25' ) ).toBeInTheDocument();

		// Row 3: CNAME www BLANK -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
	} );

	test( 'matches IPs correctly when one IP matches target', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [
			'192.0.78.24',
			'185.230.63.186',
		] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A record rows + 1 CNAME row
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: A @ 192.0.78.24 -> 192.0.78.24 (MATCHED!)
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( '192.0.78.24' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 4 ] ).getByText( '192.0.78.24' ) ).toBeInTheDocument();

		// Row 2: A @ 185.230.63.186 -> 192.0.78.25 (unmatched)
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( '185.230.63.186' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 4 ] ).getByText( '192.0.78.25' ) ).toBeInTheDocument();

		// Row 3: CNAME www BLANK -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
	} );

	test( 'renders CNAME record with BLANK when www_cname_record_target is null', async () => {
		const domainMappingStatus = createMockDomainMappingStatus(
			[ '192.0.78.24', '192.0.78.25' ],
			null
		);
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A record rows + 1 CNAME record (always shown!)
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 3: CNAME www BLANK -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 1 ] ).getByText( 'www' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 4 ] ).getByText( 'example.com' ) ).toBeInTheDocument();
	} );
} );
