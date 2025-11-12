/**
 * @jest-environment jsdom
 */
import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	DomainMappingStatus,
} from '@automattic/api-core';
import { screen, within } from '@testing-library/react';
import { render } from '../../../test-utils';
import DNSRecordsDataView from '../dns-records-dataview';

describe( 'DNSRecordsDataView - Suggested Mode (Nameservers)', () => {
	const createMockDomainMappingStatus = ( nameServers: string[] ): DomainMappingStatus => ( {
		has_mapping_records: false,
		has_wpcom_nameservers: false,
		has_wpcom_ip_addresses: false,
		has_cloudflare_ip_addresses: false,
		has_mx_records: false,
		www_cname_record_target: null,
		resolves_to_wpcom: false,
		host_ip_addresses: [],
		name_servers: nameServers,
		mode: 'suggested',
	} );

	const createMockDomainConnectionSetupInfo = (): DomainMappingSetupInfo => ( {
		connection_mode: null,
		domain_connect_apply_wpcom_hosting: null,
		domain_connect_provider_id: null,
		default_ip_addresses: [],
		wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		is_subdomain: false,
		root_domain: 'example.com',
	} );

	test( 'renders 3 rows when current nameservers match target nameservers exactly', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [
			'ns1.wordpress.com',
			'ns2.wordpress.com',
			'ns3.wordpress.com',
		] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.SUGGESTED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 3 data rows
		expect( rows ).toHaveLength( 4 );

		// Check that matched values are in the same row
		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: ns1.wordpress.com -> ns1.wordpress.com
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'ns1.wordpress.com' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( 'ns1.wordpress.com' ) ).toBeInTheDocument();

		// Row 2: ns2.wordpress.com -> ns2.wordpress.com
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'ns2.wordpress.com' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( 'ns2.wordpress.com' ) ).toBeInTheDocument();

		// Row 3: ns3.wordpress.com -> ns3.wordpress.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'ns3.wordpress.com' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'ns3.wordpress.com' ) ).toBeInTheDocument();
	} );

	test( 'renders 3 rows with "-" when only 2 current nameservers exist', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [
			'ns1.other.com',
			'ns2.other.com',
		] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.SUGGESTED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 3 data rows
		expect( rows ).toHaveLength( 4 );

		// Check row structure
		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: ns1.other.com -> ns1.wordpress.com
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'ns1.other.com' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( 'ns1.wordpress.com' ) ).toBeInTheDocument();

		// Row 2: ns2.other.com -> ns2.wordpress.com
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'ns2.other.com' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( 'ns2.wordpress.com' ) ).toBeInTheDocument();

		// Row 3: - -> ns3.wordpress.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( '-' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'ns3.wordpress.com' ) ).toBeInTheDocument();
	} );

	test( 'renders 3 rows when current has 3 different nameservers', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [
			'ns1.other.com',
			'ns2.other.com',
			'ns3.other.com',
		] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.SUGGESTED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 3 data rows
		expect( rows ).toHaveLength( 4 );

		// Check row structure
		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: ns1.other.com -> ns1.wordpress.com
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'ns1.other.com' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( 'ns1.wordpress.com' ) ).toBeInTheDocument();

		// Row 2: ns2.other.com -> ns2.wordpress.com
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'ns2.other.com' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( 'ns2.wordpress.com' ) ).toBeInTheDocument();

		// Row 3: ns3.other.com -> ns3.wordpress.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'ns3.other.com' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'ns3.wordpress.com' ) ).toBeInTheDocument();

		// Verify no - entries
		expect( screen.queryByText( '-' ) ).not.toBeInTheDocument();
	} );

	test( 'renders column headers correctly', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ 'ns1.other.com' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.SUGGESTED }
			/>
		);

		// Check for column headers
		expect( await screen.findByText( 'Current values' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Update to' ) ).toBeInTheDocument();
	} );

	test( 'handles empty current nameservers array', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.SUGGESTED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 3 data rows
		expect( rows ).toHaveLength( 4 );

		// Check row structure - all should be - -> target
		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: - -> ns1.wordpress.com
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( '-' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( 'ns1.wordpress.com' ) ).toBeInTheDocument();

		// Row 2: - -> ns2.wordpress.com
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( '-' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( 'ns2.wordpress.com' ) ).toBeInTheDocument();

		// Row 3: - -> ns3.wordpress.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( '-' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'ns3.wordpress.com' ) ).toBeInTheDocument();
	} );

	test( 'matches nameservers correctly when some overlap exists', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [
			'ns1.wordpress.com',
			'ns2.other.com',
			'ns3.other.com',
		] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.SUGGESTED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 3 data rows
		expect( rows ).toHaveLength( 4 );

		// Check row structure
		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: ns1.wordpress.com -> ns1.wordpress.com (MATCHED!)
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'ns1.wordpress.com' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( 'ns1.wordpress.com' ) ).toBeInTheDocument();

		// Row 2: ns2.other.com -> ns2.wordpress.com (unmatched)
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'ns2.other.com' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( 'ns2.wordpress.com' ) ).toBeInTheDocument();

		// Row 3: ns3.other.com -> ns3.wordpress.com (unmatched)
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'ns3.other.com' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( 'ns3.wordpress.com' ) ).toBeInTheDocument();
	} );

	test( 'renders only 3 columns in suggested mode (no type/name columns)', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ 'ns1.wordpress.com' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.SUGGESTED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );

		// Should NOT have Type or Name columns in suggested mode
		expect( screen.queryByText( 'Type' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Name' ) ).not.toBeInTheDocument();

		// Should have the basic columns
		expect( screen.getByText( 'Current values' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Update to' ) ).toBeInTheDocument();

		// Verify column count in header row
		const rows = within( table ).getAllByRole( 'row' );
		const headerCells = within( rows[ 0 ] ).getAllByRole( 'columnheader' );
		// Should have 3 columns: Current values, arrow (empty header), Update to
		expect( headerCells ).toHaveLength( 3 );
	} );
} );

describe( 'DNSRecordsDataView - Advanced Mode (A and CNAME Records)', () => {
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

	test( 'renders A records when current IPs match target IPs exactly', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ '192.0.78.24', '192.0.78.25' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.ADVANCED }
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

		// Row 3: CNAME www - -> www.example.com (no current CNAME)
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 1 ] ).getByText( 'www' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
	} );

	test( 'renders A records with - when only 1 current IP exists', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ '185.230.63.171' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.ADVANCED }
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

		// Row 2: A @ - -> 192.0.78.25
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 1 ] ).getByText( '@' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 4 ] ).getByText( '192.0.78.25' ) ).toBeInTheDocument();

		// Row 3: CNAME www - -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
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
				mode={ DomainConnectionSetupMode.ADVANCED }
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

		// Row 3: CNAME www - -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
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
				mode={ DomainConnectionSetupMode.ADVANCED }
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
				mode={ DomainConnectionSetupMode.ADVANCED }
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
				mode={ DomainConnectionSetupMode.ADVANCED }
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
				mode={ DomainConnectionSetupMode.ADVANCED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A record rows + 1 CNAME row
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: A @ - -> 192.0.78.24
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 4 ] ).getByText( '192.0.78.24' ) ).toBeInTheDocument();

		// Row 2: A @ - -> 192.0.78.25
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'A' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 4 ] ).getByText( '192.0.78.25' ) ).toBeInTheDocument();

		// Row 3: CNAME www - -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
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
				mode={ DomainConnectionSetupMode.ADVANCED }
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

		// Row 3: CNAME www - -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
	} );

	test( 'renders CNAME record with - when www_cname_record_target is null', async () => {
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
				mode={ DomainConnectionSetupMode.ADVANCED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 2 A record rows + 1 CNAME record (always shown!)
		expect( rows ).toHaveLength( 4 );

		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 3: CNAME www - -> www.example.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'CNAME' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 1 ] ).getByText( 'www' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 2 ] ).getByText( '-' ) ).toBeInTheDocument();
		expect( within( row3Cells[ 4 ] ).getByText( 'example.com' ) ).toBeInTheDocument();
	} );

	test( 'renders all 5 columns in advanced mode (including type/name)', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ '192.0.78.24' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<DNSRecordsDataView
				domainName="example.com"
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
				mode={ DomainConnectionSetupMode.ADVANCED }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );

		// Should have ALL columns in advanced mode
		expect( await screen.findByText( 'Type' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Name' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Current values' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Update to' ) ).toBeInTheDocument();

		// Verify column count in header row
		const rows = within( table ).getAllByRole( 'row' );
		const headerCells = within( rows[ 0 ] ).getAllByRole( 'columnheader' );
		// Should have 5 columns: Type, Name, Current values, arrow (empty header), Update to
		expect( headerCells ).toHaveLength( 5 );
	} );
} );
