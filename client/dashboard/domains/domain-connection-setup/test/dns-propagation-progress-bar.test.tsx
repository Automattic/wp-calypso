/**
 * @jest-environment jsdom
 */
import { DomainPropagationStatus } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { render } from '../../../test-utils';
import DnsPropagationProgressBar from '../components/dns-propagation-progress-bar';

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

const createMockPropagationStatus = (
	overrides?: Partial< DomainPropagationStatus >
): DomainPropagationStatus => ( {
	propagation_status: [
		{ area_code: 'NA', area_name: 'North America', propagated: true },
		{ area_code: 'EU', area_name: 'Europe', propagated: false },
	],
	last_updated: '2025-11-12 13:15:48',
	...overrides,
} );

describe( 'DnsPropagationProgressBar', () => {
	const mockUseQuery = useQuery as jest.MockedFunction< typeof useQuery >;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders progress bar with correct percentage', () => {
		const mockData = createMockPropagationStatus();

		mockUseQuery.mockReturnValue( {
			data: mockData,
			isLoading: false,
			isError: false,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar domainName="example.com" />
		);

		expect( getByText( 'Progress' ) ).toBeVisible();
		expect( getByText( '50%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '50' );
	} );

	test( 'rounds the progress percentage to the nearest whole number', () => {
		const mockData = createMockPropagationStatus( {
			propagation_status: [
				{ area_code: 'NA', area_name: 'North America', propagated: true },
				{ area_code: 'EU', area_name: 'Europe', propagated: true },
				{ area_code: 'AS', area_name: 'Asia', propagated: false },
			],
		} );

		mockUseQuery.mockReturnValue( {
			data: mockData,
			isLoading: false,
			isError: false,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar domainName="example.com" />
		);

		expect( getByText( '67%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '67' );
	} );

	test( 'renders 100% when every region is propagated', () => {
		const mockData = createMockPropagationStatus( {
			propagation_status: [
				{ area_code: 'NA', area_name: 'North America', propagated: true },
				{ area_code: 'EU', area_name: 'Europe', propagated: true },
			],
		} );

		mockUseQuery.mockReturnValue( {
			data: mockData,
			isLoading: false,
			isError: false,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar domainName="example.com" />
		);

		expect( getByText( '100%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );

	test( 'renders 0% when no propagation data is available', () => {
		const mockData = createMockPropagationStatus( {
			propagation_status: [],
		} );

		mockUseQuery.mockReturnValue( {
			data: mockData,
			isLoading: false,
			isError: false,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar domainName="example.com" />
		);

		expect( getByText( '0%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
	} );

	test.each( [
		{
			title: 'loading',
			queryResult: {
				data: undefined,
				isLoading: true,
				isError: false,
			},
		},
		{
			title: 'errored',
			queryResult: {
				data: undefined,
				isLoading: false,
				isError: true,
			},
		},
		{
			title: 'without data',
			queryResult: {
				data: undefined,
				isLoading: false,
				isError: false,
			},
		},
	] )( 'returns null when query is $title', ( { queryResult } ) => {
		mockUseQuery.mockReturnValue( {
			...queryResult,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any );

		const { container } = render( <DnsPropagationProgressBar domainName="example.com" /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
