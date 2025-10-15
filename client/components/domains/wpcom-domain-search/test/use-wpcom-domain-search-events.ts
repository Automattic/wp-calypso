/**
 * @jest-environment jsdom
 */

import { getNewRailcarId, recordTracksEvent } from '@automattic/calypso-analytics';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useWPCOMDomainSearchEvents } from '../use-wpcom-domain-search-events';

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	getNewRailcarId: jest.fn().mockReturnValue( 'railcar-id' ),
	recordTracksEvent: jest.fn(),
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
};

describe( 'useWPCOMDomainSearchEvents', () => {
	it( 'debounces calypso_domain_search by 10 seconds', () => {
		jest.useFakeTimers();

		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchEvents( defaultProps ) );

		result.current.onQueryChange( 'my-domain.com' );
		expect( recordTracksEvent ).not.toHaveBeenCalled();

		jest.advanceTimersByTime( 10_000 );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_domain_search',
			expect.objectContaining( {
				search_box_value: 'my-domain.com',
			} )
		);

		jest.useRealTimers();
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
