/**
 * @jest-environment jsdom
 */
import { DomainPropagationStatus } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import DomainPropagationStatusComponent from '../components/domain-propagation-status';

// Mock the useQuery hook from React Query
jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

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

describe( 'DomainPropagationStatus', () => {
	const mockUseQuery = useQuery as jest.MockedFunction< typeof useQuery >;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Successful data loading', () => {
		test( 'renders component with title when data is loaded', () => {
			const mockData = createMockPropagationStatus();
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
		} );

		test( 'renders all propagation areas with correct names', () => {
			const mockData = createMockPropagationStatus();
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			expect( screen.getByText( 'North America' ) ).toBeVisible();
			expect( screen.getByText( 'Asia' ) ).toBeVisible();
			expect( screen.getByText( 'Australia' ) ).toBeVisible();
			expect( screen.getByText( 'Africa' ) ).toBeVisible();
			expect( screen.getByText( 'South America' ) ).toBeVisible();
			expect( screen.getByText( 'Europe' ) ).toBeVisible();
		} );

		test( 'renders propagated indicators with correct ARIA labels', () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [
					{ area_code: 'NA', area_name: 'North America', propagated: true },
					{ area_code: 'EU', area_name: 'Europe', propagated: false },
				],
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			const propagatedIndicator = screen.getByLabelText( 'Propagated' );
			expect( propagatedIndicator ).toBeInTheDocument();

			const notPropagatedIndicator = screen.getByLabelText( 'Not propagated' );
			expect( notPropagatedIndicator ).toBeInTheDocument();
		} );

		test( 'renders last updated timestamp in formatted time', () => {
			const mockData = createMockPropagationStatus( {
				last_updated: '2025-11-11 13:15:48',
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			// Should show "Last checked" text with relative time
			expect( screen.getByText( /Last checked/i ) ).toBeVisible();
			expect( screen.getByText( /2m ago/i ) ).toBeVisible();
		} );

		test( 'renders with all areas propagated', () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [
					{ area_code: 'NA', area_name: 'North America', propagated: true },
					{ area_code: 'AS', area_name: 'Asia', propagated: true },
					{ area_code: 'EU', area_name: 'Europe', propagated: true },
				],
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			// All indicators should have "Propagated" ARIA label
			const propagatedIndicators = screen.getAllByLabelText( 'Propagated' );
			expect( propagatedIndicators ).toHaveLength( 3 );
		} );

		test( 'renders with all areas not propagated', () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [
					{ area_code: 'NA', area_name: 'North America', propagated: false },
					{ area_code: 'AS', area_name: 'Asia', propagated: false },
					{ area_code: 'EU', area_name: 'Europe', propagated: false },
				],
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			// All indicators should have "Not propagated" ARIA label
			const notPropagatedIndicators = screen.getAllByLabelText( 'Not propagated' );
			expect( notPropagatedIndicators ).toHaveLength( 3 );
		} );

		test( 'renders with mixed propagation status', () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [
					{ area_code: 'NA', area_name: 'North America', propagated: true },
					{ area_code: 'AS', area_name: 'Asia', propagated: false },
					{ area_code: 'EU', area_name: 'Europe', propagated: true },
				],
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			const propagatedIndicators = screen.getAllByLabelText( 'Propagated' );
			expect( propagatedIndicators ).toHaveLength( 2 );

			const notPropagatedIndicators = screen.getAllByLabelText( 'Not propagated' );
			expect( notPropagatedIndicators ).toHaveLength( 1 );
		} );
	} );

	describe( 'Loading and error states', () => {
		test( 'does not render when loading', () => {
			mockUseQuery.mockReturnValue( {
				data: undefined,
				isLoading: true,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			const { container } = render( <DomainPropagationStatusComponent domainName="example.com" /> );

			expect( container ).toBeEmptyDOMElement();
		} );

		test( 'does not render when there is an error', () => {
			mockUseQuery.mockReturnValue( {
				data: undefined,
				isLoading: false,
				isError: true,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			const { container } = render( <DomainPropagationStatusComponent domainName="example.com" /> );

			expect( container ).toBeEmptyDOMElement();
		} );

		test( 'does not render when data is undefined', () => {
			mockUseQuery.mockReturnValue( {
				data: undefined,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			const { container } = render( <DomainPropagationStatusComponent domainName="example.com" /> );

			expect( container ).toBeEmptyDOMElement();
		} );

		test( 'does not render when data is null', () => {
			mockUseQuery.mockReturnValue( {
				data: null,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			const { container } = render( <DomainPropagationStatusComponent domainName="example.com" /> );

			expect( container ).toBeEmptyDOMElement();
		} );
	} );

	describe( 'Edge cases', () => {
		test( 'renders with empty propagation status array', () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [],
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			// Should still render the component structure
			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			expect( screen.getByText( /Last checked/i ) ).toBeVisible();
		} );

		test( 'renders with single propagation area', () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [ { area_code: 'NA', area_name: 'North America', propagated: true } ],
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			expect( screen.getByText( 'North America' ) ).toBeVisible();
			expect( screen.getByLabelText( 'Propagated' ) ).toBeInTheDocument();
		} );

		test( 'handles invalid date format in last_updated', () => {
			const mockData = createMockPropagationStatus( {
				last_updated: 'invalid-date',
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			// Should still render without crashing
			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			// Should show "Last checked" text with mocked relative time
			expect( screen.getByText( /Last checked/i ) ).toBeVisible();
		} );

		test( 'handles empty string in last_updated', () => {
			const mockData = createMockPropagationStatus( {
				last_updated: '',
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			// Should still render without crashing
			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			// Should show "Last checked" text with mocked relative time
			expect( screen.getByText( /Last checked/i ) ).toBeVisible();
		} );

		test( 'handles various invalid date formats', () => {
			const invalidDates = [ 'not-a-date', '0000-00-00', '99/99/9999', 'null', 'undefined' ];

			invalidDates.forEach( ( invalidDate ) => {
				const mockData = createMockPropagationStatus( {
					last_updated: invalidDate,
				} );
				mockUseQuery.mockReturnValue( {
					data: mockData,
					isLoading: false,
					isError: false,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any );

				const { unmount } = render( <DomainPropagationStatusComponent domainName="example.com" /> );

				// Should render without crashing for any invalid date
				expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();

				unmount();
			} );
		} );
	} );

	describe( 'Component structure', () => {
		test( 'renders Card component with propagation status grid', () => {
			const mockData = createMockPropagationStatus();
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			// Verify Card component structure exists with title and content
			expect( screen.getByText( 'Global propagation status' ) ).toBeVisible();
			expect( screen.getByText( 'North America' ) ).toBeVisible();
		} );

		test( 'renders indicators with correct styling attributes', () => {
			const mockData = createMockPropagationStatus( {
				propagation_status: [ { area_code: 'NA', area_name: 'North America', propagated: true } ],
			} );
			mockUseQuery.mockReturnValue( {
				data: mockData,
				isLoading: false,
				isError: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any );

			render( <DomainPropagationStatusComponent domainName="example.com" /> );

			const indicator = screen.getByLabelText( 'Propagated' );
			expect( indicator ).toHaveStyle( {
				width: '8px',
				height: '8px',
				borderRadius: '50%',
			} );
		} );
	} );
} );
