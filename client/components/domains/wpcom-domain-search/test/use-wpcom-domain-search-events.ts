/**
 * @jest-environment jsdom
 */

import { getNewRailcarId, recordTracksEvent } from '@automattic/calypso-analytics';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { recordSearchFormSubmit } from '../analytics';
import { useWPCOMDomainSearchEvents } from '../use-wpcom-domain-search-events';

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	getNewRailcarId: jest.fn().mockReturnValue( 'railcar-id' ),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '../analytics', () => ( {
	...jest.requireActual( '../analytics' ),
	recordSearchFormSubmit: jest.fn().mockReturnValue( {
		type: 'test',
	} ),
} ) );

const mockGetNewRailcarId = getNewRailcarId as jest.MockedFunction< typeof getNewRailcarId >;

const railcarIdGenerator = () => {
	let i = 0;

	return () => {
		return `railcar-id-${ i++ }`;
	};
};

const defaultProps = {
	flowName: 'flow-name',
	flowAllowsMultipleDomainsInCart: false,
	analyticsSection: 'analytics-section',
	vendor: 'vendor',
};

describe( 'useWPCOMDomainSearchEvents', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'records calypso_domain_search once per accepted response with the search id and trigger', () => {
		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchEvents( defaultProps ) );

		result.current.onSearch( 'my-domain.com', 'search-1', 'prefilled' );

		expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 1 );
		expect( recordSearchFormSubmit ).toHaveBeenCalledWith(
			'my-domain.com',
			'analytics-section',
			0,
			1,
			'vendor',
			'flow-name',
			'search-1',
			'prefilled'
		);

		result.current.onSearch( 'my domain', 'search-2', 'submit' );

		expect( recordSearchFormSubmit ).toHaveBeenCalledTimes( 2 );
		expect( recordSearchFormSubmit ).toHaveBeenLastCalledWith(
			'my domain',
			'analytics-section',
			expect.any( Number ),
			2,
			'vendor',
			'flow-name',
			'search-2',
			'submit'
		);
	} );

	it( 'does not record calypso_domain_search when the query changes', () => {
		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchEvents( defaultProps ) );

		result.current.onQueryChange( 'my-domain.com' );

		expect( recordSearchFormSubmit ).not.toHaveBeenCalled();
	} );

	it( 'stamps flow_name and section on the interact and bundle events', () => {
		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchEvents( defaultProps ) );
		const bundle = {
			bundle_group_id: 'group-1',
			domains: [ { domain: 'my-domain.com' }, { domain: 'my-domain.net' } ],
		};

		result.current.onSuggestionInteract( {
			domain_name: 'my-domain.com',
			position: 0,
			vendor: 'wpcom',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_traintracks_interact',
			expect.objectContaining( { flow_name: 'flow-name', section: 'analytics-section' } )
		);

		result.current.onBundleShown( bundle, 'inline' );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_domain_bundle_shown', {
			domain_bundle_group_id: 'group-1',
			domain_count: 2,
			placement: 'inline',
			flow_name: 'flow-name',
			section: 'analytics-section',
		} );

		result.current.onBundleAddToCart( bundle, 'card' );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_domain_bundle_accepted', {
			domain_bundle_group_id: 'group-1',
			domain_count: 2,
			placement: 'card',
			flow_name: 'flow-name',
			section: 'analytics-section',
		} );
	} );

	it( 'registers a new railcar id when the query changes', () => {
		mockGetNewRailcarId.mockImplementation( railcarIdGenerator() );
		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchEvents( defaultProps ) );

		// Initial suggestion interaction
		result.current.onSuggestionInteract( {
			domain_name: 'my-domain.com',
			position: 0,
			vendor: 'wpcom',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_traintracks_interact',
			expect.objectContaining( {
				railcar: 'railcar-id-0-0',
			} )
		);

		// Repeat interaction without changing the query
		result.current.onSuggestionInteract( {
			domain_name: 'my-domain.com',
			position: 0,
			vendor: 'wpcom',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_traintracks_interact',
			expect.objectContaining( {
				railcar: 'railcar-id-0-0',
			} )
		);

		// Change query and interact with a new suggestion
		result.current.onQueryChange( 'my-domain.com' );

		// Interact with a new suggestion
		result.current.onSuggestionInteract( {
			domain_name: 'my-domain.com',
			position: 0,
			vendor: 'wpcom',
		} );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_traintracks_interact',
			expect.objectContaining( {
				railcar: 'railcar-id-1-0',
			} )
		);
	} );
} );
