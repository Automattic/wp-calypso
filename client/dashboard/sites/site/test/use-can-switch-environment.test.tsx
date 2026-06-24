/**
 * @jest-environment jsdom
 */
import { siteByIdQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import useCanSwitchEnvironment from '../use-can-switch-environment';
import type { Site } from '@automattic/api-core';

const productionSite = {
	ID: 1,
	slug: 'production-site',
	is_wpcom_atomic: true,
	is_wpcom_staging_site: false,
	is_a4a_dev_site: false,
	capabilities: { manage_options: true },
	plan: { features: { active: [ 'staging-sites' ] } },
	options: { wpcom_staging_blog_ids: [ 2 ] },
	site_migration: { in_progress: false, is_complete: false },
} as unknown as Site;

const stagingSite = {
	ID: 2,
	slug: 'staging-site',
	is_wpcom_atomic: true,
	is_wpcom_staging_site: true,
	is_a4a_dev_site: false,
	capabilities: { manage_options: true },
	plan: { features: { active: [ 'staging-sites' ] } },
	options: { wpcom_production_blog_id: 1 },
	site_migration: { in_progress: false, is_complete: false },
} as unknown as Site;

function renderUseCanSwitchEnvironment( currentSite: Site | undefined, sites: Site[] ) {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
		},
	} );

	for ( const site of sites ) {
		queryClient.setQueryData( siteByIdQuery( site.ID ).queryKey, site );
	}

	return renderHook( () => useCanSwitchEnvironment( currentSite ), {
		wrapper: ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		),
	} );
}

describe( 'useCanSwitchEnvironment', () => {
	test( 'returns true when the user can manage the other environment', async () => {
		const { result } = renderUseCanSwitchEnvironment( productionSite, [
			productionSite,
			stagingSite,
		] );
		await waitFor( () => expect( result.current ).toBe( true ) );
	} );

	test( 'returns false for a secondary admin who cannot manage the staging environment', async () => {
		const unmanageableStagingSite = {
			...stagingSite,
			capabilities: { manage_options: false },
		} as unknown as Site;
		const { result } = renderUseCanSwitchEnvironment( productionSite, [
			productionSite,
			unmanageableStagingSite,
		] );
		await waitFor( () => expect( result.current ).toBe( false ) );
	} );

	test( 'returns true when no staging site exists yet but staging can be created', async () => {
		const productionSiteWithoutStaging = {
			...productionSite,
			options: { wpcom_staging_blog_ids: [] },
		} as unknown as Site;
		const { result } = renderUseCanSwitchEnvironment( productionSiteWithoutStaging, [
			productionSiteWithoutStaging,
		] );
		await waitFor( () => expect( result.current ).toBe( true ) );
	} );

	test( 'returns true on a staging site when the user can manage production', async () => {
		const { result } = renderUseCanSwitchEnvironment( stagingSite, [
			productionSite,
			stagingSite,
		] );
		await waitFor( () => expect( result.current ).toBe( true ) );
	} );

	test( 'returns false when the site lacks the staging feature', async () => {
		const productionSiteWithoutFeature = {
			...productionSite,
			plan: { features: { active: [] } },
		} as unknown as Site;
		const { result } = renderUseCanSwitchEnvironment( productionSiteWithoutFeature, [
			productionSiteWithoutFeature,
			stagingSite,
		] );
		await waitFor( () => expect( result.current ).toBe( false ) );
	} );

	test( 'returns false when no site is provided', async () => {
		const { result } = renderUseCanSwitchEnvironment( undefined, [] );
		await waitFor( () => expect( result.current ).toBe( false ) );
	} );
} );
