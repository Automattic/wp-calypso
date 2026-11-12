/**
 * @jest-environment jsdom
 */
import { DomainPropagationStatus } from '@automattic/api-core';
import { domainPropagationStatusQuery } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import DomainPropagationStatusComponent from '../components/domain-propagation-status';

// Mock the useTimeSince hook
jest.mock( '../../../components/time-since', () => ( {
	useTimeSince: jest.fn( () => '2m ago' ),
} ) );

const createMockPropagationStatus = (
	overrides?: Partial< DomainPropagationStatus >
): DomainPropagationStatus => ( {
	propagation_status: [
		{ area_code: 'NA', area_name: 'North America', propagated: true },
		{ area_code: 'AS', area_name: 'Asia', propagated: true },
		{ area_code: 'OC', area_name: 'Australia', propagated: true },
		{ area_code: 'AF', area_name: 'Africa', propagated: true },
		{ area_code: 'SA', area_name: 'South America', propagated: false },
		{ area_code: 'EU', area_name: 'Europe', propagated: false },
	],
	last_updated: '2025-11-11 13:15:48',
	...overrides,
} );

const queryKey = domainPropagationStatusQuery( 'example.com' ).queryKey;

function mockPropagationStatus( status: number, body?: DomainPropagationStatus | null ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/domains/propagation-status/example.com/' )
		.reply( status, JSON.stringify( body ?? null ), { 'Content-Type': 'application/json' } );
}

async function renderLoaded() {
	render( <DomainPropagationStatusComponent domainName="example.com" /> );
	await screen.findByText( 'Global propagation status' );
}

describe( 'DomainPropagationStatus', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	describe( 'Successful data loading', () => {
		test( 'renders component with title when data is loaded', async () => {
			const mockData = createMockPropagationStatus();
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
		} );

		test( 'renders all propagation areas with correct names', async () => {
			const mockData = createMockPropagationStatus();
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			expect( screen.getByText( 'North America' ) ).toBeVisible();
			expect( screen.getByText( 'Asia' ) ).toBeVisible();
			expect( screen.getByText( 'Australia' ) ).toBeVisible();
			expect( screen.getByText( 'Africa' ) ).toBeVisible();
			expect( screen.getByText( 'South America' ) ).toBeVisible();
			expect( screen.getByText( 'Europe' ) ).toBeVisible();
		} );

		test( 'renders propagated indicators with correct ARIA labels', async () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [
					{ area_code: 'NA', area_name: 'North America', propagated: true },
					{ area_code: 'EU', area_name: 'Europe', propagated: false },
				],
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			const propagatedIndicator = screen.getByLabelText( 'Propagated' );
			expect( propagatedIndicator ).toBeInTheDocument();

			const notPropagatedIndicator = screen.getByLabelText( 'Not propagated' );
			expect( notPropagatedIndicator ).toBeInTheDocument();
		} );

		test( 'renders last updated timestamp in formatted time', async () => {
			const mockData = createMockPropagationStatus( {
				last_updated: '2025-11-11 13:15:48',
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			// Should show "Last checked" text with relative time
			expect( screen.getByText( /Last checked/i ) ).toBeVisible();
			expect( screen.getByText( /2m ago/i ) ).toBeVisible();
		} );

		test( 'renders with all areas propagated', async () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [
					{ area_code: 'NA', area_name: 'North America', propagated: true },
					{ area_code: 'AS', area_name: 'Asia', propagated: true },
					{ area_code: 'EU', area_name: 'Europe', propagated: true },
				],
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			// All indicators should have "Propagated" ARIA label
			const propagatedIndicators = screen.getAllByLabelText( 'Propagated' );
			expect( propagatedIndicators ).toHaveLength( 3 );
		} );

		test( 'renders with all areas not propagated', async () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [
					{ area_code: 'NA', area_name: 'North America', propagated: false },
					{ area_code: 'AS', area_name: 'Asia', propagated: false },
					{ area_code: 'EU', area_name: 'Europe', propagated: false },
				],
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			// All indicators should have "Not propagated" ARIA label
			const notPropagatedIndicators = screen.getAllByLabelText( 'Not propagated' );
			expect( notPropagatedIndicators ).toHaveLength( 3 );
		} );

		test( 'renders with mixed propagation status', async () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [
					{ area_code: 'NA', area_name: 'North America', propagated: true },
					{ area_code: 'AS', area_name: 'Asia', propagated: false },
					{ area_code: 'EU', area_name: 'Europe', propagated: true },
				],
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			const propagatedIndicators = screen.getAllByLabelText( 'Propagated' );
			expect( propagatedIndicators ).toHaveLength( 2 );

			const notPropagatedIndicators = screen.getAllByLabelText( 'Not propagated' );
			expect( notPropagatedIndicators ).toHaveLength( 1 );
		} );
	} );

	describe( 'Loading and error states', () => {
		test( 'does not render when loading', async () => {
			mockPropagationStatus( 200, createMockPropagationStatus() );

			const { container } = render( <DomainPropagationStatusComponent domainName="example.com" /> );

			expect( container ).toBeEmptyDOMElement();
			expect( await screen.findByText( 'Global propagation status' ) ).toBeVisible();
		} );

		test( 'does not render when there is an error', async () => {
			mockPropagationStatus( 500 );

			const { container, queryClient } = render(
				<DomainPropagationStatusComponent domainName="example.com" />
			);

			await waitFor( () =>
				expect( queryClient.getQueryState( queryKey )?.status ).toBe( 'error' )
			);
			expect( container ).toBeEmptyDOMElement();
		} );

		test( 'does not render when data is null', async () => {
			mockPropagationStatus( 200, null );

			const { container, queryClient } = render(
				<DomainPropagationStatusComponent domainName="example.com" />
			);

			await waitFor( () =>
				expect( queryClient.getQueryState( queryKey )?.status ).toBe( 'success' )
			);
			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	describe( 'Edge cases', () => {
		test( 'renders with empty propagation status array', async () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [],
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			// Should still render the component structure
			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			expect( screen.getByText( /Last checked/i ) ).toBeVisible();
		} );

		test( 'renders with single propagation area', async () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [ { area_code: 'NA', area_name: 'North America', propagated: true } ],
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			expect( screen.getByText( 'North America' ) ).toBeVisible();
			expect( screen.getByLabelText( 'Propagated' ) ).toBeInTheDocument();
		} );

		test( 'handles invalid date format in last_updated', async () => {
			const mockData = createMockPropagationStatus( {
				last_updated: 'invalid-date',
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			// Should still render without crashing
			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			// Should show "Last checked" text with mocked relative time
			expect( screen.getByText( /Last checked/i ) ).toBeVisible();
		} );

		test( 'handles empty string in last_updated', async () => {
			const mockData = createMockPropagationStatus( {
				last_updated: '',
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			// Should still render without crashing
			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			// Should show "Last checked" text with mocked relative time
			expect( screen.getByText( /Last checked/i ) ).toBeVisible();
		} );

		test.each( [ 'not-a-date', '0000-00-00', '99/99/9999', 'null', 'undefined' ] )(
			'handles the invalid date %s',
			async ( invalidDate ) => {
				mockPropagationStatus( 200, createMockPropagationStatus( { last_updated: invalidDate } ) );

				await renderLoaded();

				expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			}
		);
	} );

	describe( 'Component structure', () => {
		test( 'renders Card component with propagation status grid', async () => {
			const mockData = createMockPropagationStatus();
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			// Verify Card component structure exists with title and content
			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			expect( screen.getByText( 'North America' ) ).toBeVisible();
		} );

		test( 'renders indicators with correct styling attributes', async () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [ { area_code: 'NA', area_name: 'North America', propagated: true } ],
			} );
			mockPropagationStatus( 200, mockData );

			await renderLoaded();

			const indicator = screen.getByLabelText( 'Propagated' );
			expect( indicator ).toHaveStyle( {
				width: '8px',
				height: '8px',
				borderRadius: '50%',
			} );
		} );
	} );
} );
