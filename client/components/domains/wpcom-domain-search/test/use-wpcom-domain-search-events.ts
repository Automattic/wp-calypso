/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { recordSearchFormSubmit, recordSearchResultsReceive } from '../analytics';
import { useWPCOMDomainSearchEvents } from '../use-wpcom-domain-search-events';

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '../analytics', () => ( {
	...jest.requireActual( '../analytics' ),
	recordSearchFormSubmit: jest.fn().mockReturnValue( {
		type: 'test',
	} ),
	recordSearchResultsReceive: jest.fn().mockReturnValue( {
		type: 'test',
	} ),
} ) );

const defaultProps = {
	flowName: 'flow-name',
	flowAllowsMultipleDomainsInCart: false,
	analyticsSection: 'analytics-section',
	vendor: 'vendor',
	searchUiVersion: 'legacy_v1' as const,
};

const buildSuggestion = ( overrides: Record< string, unknown > = {} ) => ( {
	domain_name: 'my-domain.com',
	position: 0,
	vendor: 'wpcom',
	railcar: 'result-set-1-0',
	result_set_id: 'result-set-1',
	availability_at_render: 'unknown' as const,
	...overrides,
} );

describe( 'useWPCOMDomainSearchEvents', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'records calypso_domain_search once per accepted response with the search id, trigger and query shape', () => {
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
			'prefilled',
			'fqdn',
			'legacy_v1'
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
			'submit',
			'keyword',
			'legacy_v1'
		);
	} );

	it( 'records the receive event with the search id, result set id and per-group counts', () => {
		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchEvents( defaultProps ) );

		result.current.onSuggestionsReceive( 'my-domain', [ 'my-domain.com', 'my-domain.net' ], 10, {
			searchId: 'search-1',
			resultSetId: 'result-set-1',
			resultCountFeatured: 2,
			resultCountList: 0,
		} );

		expect( recordSearchResultsReceive ).toHaveBeenCalledWith(
			'my-domain',
			[ 'my-domain.com', 'my-domain.net' ],
			10,
			'analytics-section',
			'flow-name',
			{
				searchId: 'search-1',
				resultSetId: 'result-set-1',
				resultCountFeatured: 2,
				resultCountList: 0,
				searchUiVersion: 'legacy_v1',
			}
		);
	} );

	it( 'reuses the railcar stored on the suggestion for render and interact', () => {
		const { result } = renderHookWithProvider( () =>
			useWPCOMDomainSearchEvents( { ...defaultProps, query: 'my-domain' } )
		);
		const suggestion = buildSuggestion();

		result.current.onSuggestionRender( suggestion, 'featured', 'recommended' );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_traintracks_render',
			expect.objectContaining( {
				railcar: 'result-set-1-0',
				result_set_id: 'result-set-1',
				result_group: 'featured',
				is_ai_generated: false,
				availability_at_render: 'unknown',
				search_ui_version: 'legacy_v1',
				rec_result: 'my-domain.com#recommended',
				flow_name: 'flow-name',
			} )
		);

		result.current.onSuggestionInteract( suggestion );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_traintracks_interact', {
			railcar: 'result-set-1-0',
			action: 'domain_added_to_cart',
			domain: 'my-domain.com',
			root_vendor: 'wpcom',
			flow_name: 'flow-name',
			section: 'analytics-section',
		} );
	} );

	it( 'stamps flow_name, section and result_group on the bundle events', () => {
		const { result } = renderHookWithProvider( () => useWPCOMDomainSearchEvents( defaultProps ) );
		const bundle = {
			bundle_group_id: 'group-1',
			domains: [ { domain: 'my-domain.com' }, { domain: 'my-domain.net' } ],
		};

		result.current.onBundleShown( bundle, 'inline' );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_domain_bundle_shown', {
			domain_bundle_group_id: 'group-1',
			domain_count: 2,
			placement: 'inline',
			result_group: 'bundle',
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
} );
