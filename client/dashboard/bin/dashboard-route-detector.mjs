#!/usr/bin/env node

/**
 * Dashboard Route Detector
 *
 * Maps changed files in client/dashboard/** to their corresponding dashboard routes.
 * Used by the /dashboard-pr-screenshots skill to determine which routes to screenshot.
 *
 * Usage:
 *   node bin/dashboard-route-detector.mjs
 *   node bin/dashboard-route-detector.mjs --base-branch main
 *
 * Output:
 *   JSON array of routes to screenshot, e.g.: ["/sites", "/me/profile"]
 */

import { execSync } from 'child_process';

// Directory-to-route mapping based on TanStack Router structure
const DIRECTORY_ROUTE_MAP = {
	'client/dashboard/sites/overview': [ '/sites/$siteSlug' ],
	'client/dashboard/sites/backups': [ '/sites/$siteSlug/backups' ],
	'client/dashboard/sites/backup-download': [ '/sites/$siteSlug/backups' ],
	'client/dashboard/sites/backup-restore': [ '/sites/$siteSlug/backups' ],
	'client/dashboard/sites/settings': [ '/sites/$siteSlug/settings' ],
	'client/dashboard/sites/deployments': [ '/sites/$siteSlug/deployments' ],
	'client/dashboard/sites/monitoring': [ '/sites/$siteSlug/monitoring' ],
	'client/dashboard/sites/logs': [ '/sites/$siteSlug/logs' ],
	'client/dashboard/sites/scan': [ '/sites/$siteSlug/scan' ],
	'client/dashboard/sites/performance': [ '/sites/$siteSlug/performance' ],
	'client/dashboard/sites/domains': [ '/sites/$siteSlug/domains' ],
	'client/dashboard/me/profile': [ '/me/profile' ],
	'client/dashboard/me/billing': [ '/me/billing' ],
	'client/dashboard/me/billing-purchases': [ '/me/purchases' ],
	'client/dashboard/me/billing-history': [ '/me/billing/history' ],
	'client/dashboard/me/billing-payment-methods': [ '/me/payment-methods' ],
	'client/dashboard/me/security': [ '/me/security' ],
	'client/dashboard/me/preferences': [ '/me/preferences' ],
	'client/dashboard/me/privacy': [ '/me/privacy' ],
	'client/dashboard/me/notifications': [ '/me/notifications' ],
	'client/dashboard/domains': [ '/domains' ],
	'client/dashboard/emails': [ '/emails' ],
	'client/dashboard/plugins': [ '/plugins' ],
};

// Shared directories that affect multiple routes
const SHARED_DIRECTORIES = [ 'client/dashboard/components', 'client/dashboard/app' ];

// Priority routes to screenshot when shared components change
const PRIORITY_ROUTES = [
	'/sites',
	'/sites/$siteSlug',
	'/domains',
	'/domains/$domainSlug',
	'/emails',
	'/plugins',
	'/me',
];

/**
 * Get list of changed files in the dashboard directory
 */
function getChangedFiles( baseBranch = 'origin/trunk' ) {
	try {
		const output = execSync(
			`git diff ${ baseBranch }...HEAD --name-only -- 'client/dashboard/**'`,
			{ encoding: 'utf-8' }
		);
		return output
			.trim()
			.split( '\n' )
			.filter( ( file ) => file.length > 0 );
	} catch ( error ) {
		console.error( 'Error getting changed files:', error.message );
		return [];
	}
}

/**
 * Map a file path to its corresponding routes
 */
function mapFileToRoutes( filePath ) {
	// Check if file is in a shared directory
	for ( const sharedDir of SHARED_DIRECTORIES ) {
		if ( filePath.startsWith( sharedDir ) ) {
			return PRIORITY_ROUTES;
		}
	}

	// Find matching directory mapping
	for ( const [ directory, routes ] of Object.entries( DIRECTORY_ROUTE_MAP ) ) {
		if ( filePath.startsWith( directory ) ) {
			return routes;
		}
	}

	// Try to infer route from parent directories
	const dashboardMatch = filePath.match( /^client\/dashboard\/([^/]+)/ );
	if ( dashboardMatch ) {
		const section = dashboardMatch[ 1 ];
		// Map top-level sections to routes
		if ( section === 'sites' ) {
			return [ '/sites/$siteSlug' ];
		}
		if ( section === 'me' ) {
			return [ '/me' ];
		}
		return [ `/${ section }` ];
	}

	return [];
}

/**
 * Detect routes to screenshot based on changed files
 */
function detectRoutes( baseBranch = 'origin/trunk' ) {
	const changedFiles = getChangedFiles( baseBranch );

	if ( changedFiles.length === 0 ) {
		console.error( 'No changed files found in client/dashboard/**' );
		return [];
	}

	const routeSet = new Set();

	for ( const file of changedFiles ) {
		const routes = mapFileToRoutes( file );
		for ( const route of routes ) {
			routeSet.add( route );
		}
	}

	return Array.from( routeSet );
}

// Parse command line arguments
const args = process.argv.slice( 2 );
let baseBranch = 'origin/trunk';

for ( let i = 0; i < args.length; i++ ) {
	if ( args[ i ] === '--base-branch' && args[ i + 1 ] ) {
		baseBranch = args[ i + 1 ];
		i++;
	}
}

// Run detection and output results
const routes = detectRoutes( baseBranch );
console.log( JSON.stringify( routes, null, 2 ) );
