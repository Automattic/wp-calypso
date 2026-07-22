/**
 * @jest-environment jsdom
 */

import {
	APP_CONTEXT_DEFAULT_CONFIG,
	type AppConfig,
	type SiteSectionsSupports,
	type SitesSupports,
} from '../../context';
import { getRouter } from '../index';

// Targeted tests for the config-driven site route tree: each `sections` flag
// must register exactly its own subtree. A change to the shared routes that
// would silently alter what another variant registers fails here.

const ALL_SECTIONS: SiteSectionsSupports = {
	domains: true,
	plans: true,
	backups: true,
	scan: true,
	performance: true,
	monitoring: true,
	deployments: true,
	logs: { activity: true, php: true, server: true },
	settings: true,
};

const NO_SECTIONS: SiteSectionsSupports = {
	domains: false,
	plans: false,
	backups: false,
	scan: false,
	performance: false,
	monitoring: false,
	deployments: false,
	logs: false,
	settings: false,
};

function getRouteIds( sites: SitesSupports | false ): string[] {
	const config: AppConfig = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		mainRoute: '/sites',
		supports: {
			...APP_CONTEXT_DEFAULT_CONFIG.supports,
			sites,
		},
	};
	return Object.keys( getRouter( config ).routesById ).sort();
}

function getSectionRouteIds( sections: SiteSectionsSupports ): string[] {
	return getRouteIds( { sections, lockSelfHostedJetpackToOverview: true } );
}

test( 'no site routes register when sites is unsupported', () => {
	const siteRouteIds = getRouteIds( false ).filter( ( id ) => id.startsWith( '/sites' ) );
	expect( siteRouteIds ).toEqual( [] );
} );

test( 'lifecycle routes register even with every section disabled', () => {
	expect( getSectionRouteIds( NO_SECTIONS ) ).toEqual(
		expect.arrayContaining( [
			'/sites/$siteSlug',
			'/sites/$siteSlug/',
			'/sites/$siteSlug/critical-error',
			'/sites/$siteSlug/trial-ended',
			'/sites/$siteSlug/site-building-in-progress',
			'/sites/$siteSlug/migration-overview',
			'/sites/$siteSlug/ssh-migration-complete',
			'/sites/$siteSlug/ssh-migration-failed',
		] )
	);
} );

describe( 'disabling a section removes exactly its own subtree', () => {
	const SECTION_PREFIXES: Record< keyof SiteSectionsSupports, string > = {
		domains: '/sites/$siteSlug/domains',
		plans: '/sites/$siteSlug/plans',
		backups: '/sites/$siteSlug/backups',
		scan: '/sites/$siteSlug/scan',
		performance: '/sites/$siteSlug/performance',
		monitoring: '/sites/$siteSlug/monitoring',
		deployments: '/sites/$siteSlug/deployments',
		logs: '/sites/$siteSlug/logs',
		settings: '/sites/$siteSlug/settings',
	};

	for ( const [ section, prefix ] of Object.entries( SECTION_PREFIXES ) ) {
		test( `${ section }`, () => {
			const baseline = getSectionRouteIds( ALL_SECTIONS );
			const without = getSectionRouteIds( { ...ALL_SECTIONS, [ section ]: false } );
			const removed = baseline.filter( ( id ) => ! without.includes( id ) );
			const added = without.filter( ( id ) => ! baseline.includes( id ) );

			expect( removed.length ).toBeGreaterThan( 0 );
			expect( removed.every( ( id ) => id.startsWith( prefix ) ) ).toBe( true );
			expect( without.filter( ( id ) => id.startsWith( prefix ) ) ).toEqual( [] );
			expect( added ).toEqual( [] );
		} );
	}
} );

test( 'log types register individually', () => {
	const ids = getSectionRouteIds( {
		...ALL_SECTIONS,
		logs: { activity: true, php: false, server: false },
	} );
	expect( ids ).toContain( '/sites/$siteSlug/logs/activity' );
	expect( ids ).not.toContain( '/sites/$siteSlug/logs/php' );
	expect( ids ).not.toContain( '/sites/$siteSlug/logs/server' );
} );
