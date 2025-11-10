/**
 * @jest-environment jsdom
 */
import { DomainMappingSetupInfo, DomainMappingStatus } from '@automattic/api-core';
import { screen, within } from '@testing-library/react';
import { render } from '../../../test-utils';
import NameserversDataView from '../nameservers-dataview';

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

describe( 'NameserversDataView', () => {
	test( 'renders 3 rows when current nameservers match target nameservers exactly', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [
			'ns1.wordpress.com',
			'ns2.wordpress.com',
			'ns3.wordpress.com',
		] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<NameserversDataView
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
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

	test( 'renders 3 rows with "BLANK" when only 2 current nameservers exist', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [
			'ns1.other.com',
			'ns2.other.com',
		] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<NameserversDataView
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
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

		// Row 3: BLANK -> ns3.wordpress.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
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
			<NameserversDataView
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
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

		// Verify no BLANK entries
		expect( screen.queryByText( 'BLANK' ) ).not.toBeInTheDocument();
	} );

	test( 'renders column headers correctly', async () => {
		const domainMappingStatus = createMockDomainMappingStatus( [ 'ns1.other.com' ] );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

		render(
			<NameserversDataView
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
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
			<NameserversDataView
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		// Wait for DataViews to render
		const table = await screen.findByRole( 'table' );
		const rows = within( table ).getAllByRole( 'row' );

		// 4 rows total: 1 header + 3 data rows
		expect( rows ).toHaveLength( 4 );

		// Check row structure - all should be BLANK -> target
		const dataRows = rows.slice( 1 ); // Skip header row

		// Row 1: BLANK -> ns1.wordpress.com
		const row1Cells = within( dataRows[ 0 ] ).getAllByRole( 'cell' );
		expect( within( row1Cells[ 0 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
		expect( within( row1Cells[ 2 ] ).getByText( 'ns1.wordpress.com' ) ).toBeInTheDocument();

		// Row 2: BLANK -> ns2.wordpress.com
		const row2Cells = within( dataRows[ 1 ] ).getAllByRole( 'cell' );
		expect( within( row2Cells[ 0 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
		expect( within( row2Cells[ 2 ] ).getByText( 'ns2.wordpress.com' ) ).toBeInTheDocument();

		// Row 3: BLANK -> ns3.wordpress.com
		const row3Cells = within( dataRows[ 2 ] ).getAllByRole( 'cell' );
		expect( within( row3Cells[ 0 ] ).getByText( 'BLANK' ) ).toBeInTheDocument();
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
			<NameserversDataView
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
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
} );
