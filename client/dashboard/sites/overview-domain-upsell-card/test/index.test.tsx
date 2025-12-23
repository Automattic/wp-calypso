/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import DomainUpsellCard from '../index';
import type { Site } from '@automattic/api-core';

const mockUseQuery = jest.fn();

const mockSiteBase: Partial< Site > = {
	ID: 123,
	plan: {
		is_free: true,
		product_id: 1,
		product_slug: 'free-plan',
		product_name_short: 'Free',
		expired: false,
		features: {
			active: [],
		},
	},
	capabilities: {
		manage_options: true,
		update_plugins: true,
	},
	is_a4a_dev_site: false,
	is_a8c: false,
	is_deleted: false,
	is_coming_soon: false,
	is_private: false,
	is_wpcom_atomic: true,
	is_wpcom_flex: false,
	is_wpcom_staging_site: false,
	is_vip: false,
	lang: 'en',
	launch_status: 'launched',
	site_migration: {
		in_progress: false,
		is_complete: false,
	},
	site_owner: 1,
	jetpack: false,
	jetpack_connection: false,
	jetpack_modules: [],
	was_ecommerce_trial: false,
	was_migration_trial: false,
	was_hosting_trial: false,
	was_upgraded_from_trial: false,
	is_garden: false,
	garden_name: null,
	garden_partner: null,
	garden_is_provisioned: null,
};

jest.mock( '@automattic/api-queries', () => ( {
	...jest.requireActual( '@automattic/api-queries' ),
	siteCurrentPlanQuery: ( siteId: number ) => ( {
		queryKey: [ 'site-current-plan', siteId ],
		queryFn: () =>
			Promise.resolve( {
				id: 1,
				has_domain_credit: true,
			} ),
	} ),
	domainSuggestionsQuery: ( search: string ) => ( {
		queryKey: [ 'domain-suggestions', search ],
		queryFn: () =>
			Promise.resolve( [
				{
					domain_name: `${ search }.com`,
					product_slug: 'domain-product',
				},
			] ),
	} ),
} ) );

jest.mock( '@tanstack/react-query', () => {
	const actual = jest.requireActual( '@tanstack/react-query' );
	return {
		...actual,
		useQuery: ( options: { queryKey?: unknown[]; enabled?: boolean } ) => {
			mockUseQuery( options );
			return actual.useQuery( options );
		},
	};
} );

jest.mock( '@wordpress/i18n', () => ( {
	...jest.requireActual( '@wordpress/i18n' ),
	__: ( text: string ) => text,
} ) );

describe( 'DomainUpsellCard', () => {
	afterEach( () => {
		jest.clearAllMocks();
		mockUseQuery.mockClear();
	} );

	test( 'renders when site has a slug', async () => {
		const site: Site = {
			...mockSiteBase,
			slug: 'example.wordpress.com',
			name: 'Example Site Name',
			URL: 'https://example.wordpress.com',
		} as Site;

		render( <DomainUpsellCard site={ site } /> );

		expect( await screen.findByText( 'Claim your free domain' ) ).toBeVisible();
		// The blurred fallback should not be used when we have a suggestion.
		expect( screen.queryByText( 'example' ) ).not.toBeInTheDocument();
	} );

	test( 'does not render when site slug is missing', async () => {
		const site: Site = {
			...mockSiteBase,
			name: 'No Slug Site',
			URL: 'https://no-slug.example.com',
		} as Site;

		render( <DomainUpsellCard site={ site } /> );

		// Wait until the domain suggestions query has been registered and ensure it is disabled
		// when slug is missing.
		await waitFor( () => {
			const domainSuggestionCall = mockUseQuery.mock.calls.find( ( [ options ] ) => {
				if ( ! options || typeof options !== 'object' ) {
					return false;
				}

				const typedOptions = options as { queryKey?: unknown[] };
				return (
					Array.isArray( typedOptions.queryKey ) &&
					typedOptions.queryKey[ 0 ] === 'domain-suggestions'
				);
			} );

			expect( domainSuggestionCall ).toBeDefined();
			const [ options ] = domainSuggestionCall as [ { enabled?: boolean } ];
			expect( options.enabled ).toBe( false );
		} );
	} );
} );
