#!/usr/bin/env node

/**
 * Dashboard Component Screenshot Tool
 *
 * Automatically screenshots dashboard pages affected by component changes.
 * Parses router files to build page-to-route mappings programmatically.
 *
 * Usage:
 *   node .claude/commands/scripts/dashboard-screenshot-affected.mjs
 *
 * Environment Variables:
 *   SCREENSHOT_SITE_SLUG - Site slug for /sites routes (default: first available)
 *   BASE_URL - Target URL (default: http://localhost:3000)
 */

import { chromium } from 'playwright';
import { mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const ROOT_DIR = resolve( __dirname, '../../..' );
const DASHBOARD_DIR = resolve( ROOT_DIR, 'client/dashboard' );
const COMMANDS_DIR = resolve( __dirname, '..' );

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SITE_SLUG = process.env.SCREENSHOT_SITE_SLUG || '';
const OUTPUT_DIR = resolve( COMMANDS_DIR, 'screenshots' );

/**
 * Parse router files to extract page-directory to route mapping.
 * Analyzes the TanStack Router configuration to build a map of
 * page directories to their corresponding URL paths.
 */
async function buildRouteMap() {
	const routeMap = new Map();

	const routerFiles = [
		resolve( DASHBOARD_DIR, 'app/router/sites.tsx' ),
		resolve( DASHBOARD_DIR, 'app/router/me.tsx' ),
	];

	for ( const routerFile of routerFiles ) {
		if ( ! existsSync( routerFile ) ) {
			continue;
		}

		const content = await readFile( routerFile, 'utf-8' );

		// Split by route definitions to analyze each route block
		const routeBlocks = content.split( /export const (\w+)Route = createRoute/ );

		for ( let i = 1; i < routeBlocks.length; i += 2 ) {
			const routeName = routeBlocks[ i ];
			const block = routeBlocks[ i + 1 ];

			if ( ! block ) {
				continue;
			}

			// Extract path from route definition
			const pathMatch = block.match( /path:\s*['"]([^'"]+)['"]/ );
			// Extract lazy import to get page directory
			const importMatch = block.match( /import\(\s*['"]\.\.\/\.\.\/([^'"]+)['"]\s*\)/ );
			// Extract parent route
			const parentMatch = block.match( /getParentRoute:\s*\(\)\s*=>\s*(\w+)/ );

			if ( ! importMatch ) {
				continue;
			}

			const pageDir = importMatch[ 1 ]; // e.g., 'sites/performance' or 'me/profile'
			const path = pathMatch ? pathMatch[ 1 ] : '/';
			const parent = parentMatch ? parentMatch[ 1 ] : '';

			// Build full route path based on parent route
			let fullPath = '';

			if ( parent === 'siteRoute' ) {
				// Direct child of /sites/$siteSlug
				fullPath = `/sites/$siteSlug${ path === '/' ? '' : '/' + path }`;
			} else if ( parent === 'rootRoute' ) {
				// Direct child of root
				fullPath = `/${ path === '/' ? '' : path }`;
			} else if ( parent === 'meRoute' ) {
				// Child of /me
				fullPath = `/me${ path === '/' ? '' : '/' + path }`;
			} else if ( parent.startsWith( 'site' ) && parent.endsWith( 'Route' ) ) {
				// Nested under another site route (e.g., siteLogsRoute -> siteLogsPhpRoute)
				const parentRouteName = parent.replace( /^site/, '' ).replace( /Route$/, '' ).toLowerCase();
				fullPath = `/sites/$siteSlug/${ parentRouteName }${ path === '/' ? '' : '/' + path }`;
			}

			if ( fullPath ) {
				routeMap.set( pageDir, fullPath );
			}
		}
	}

	// Add known base routes that may be missed by regex
	const knownMappings = {
		'sites/overview': '/sites/$siteSlug',
		'sites/site': '/sites/$siteSlug',
		me: '/me',
		'me/profile': '/me/profile',
		'me/preferences': '/me/preferences',
		'me/billing': '/me/billing',
		'me/security': '/me/security',
	};

	for ( const [ dir, route ] of Object.entries( knownMappings ) ) {
		if ( ! routeMap.has( dir ) ) {
			routeMap.set( dir, route );
		}
	}

	return routeMap;
}

/**
 * Find modified component directories using git diff.
 */
function getModifiedComponents() {
	const componentsDir = 'client/dashboard/components/';

	try {
		const staged = execSync( 'git diff --name-only --cached -- ' + componentsDir, {
			encoding: 'utf-8',
			cwd: ROOT_DIR,
		} );
		const unstaged = execSync( 'git diff --name-only HEAD -- ' + componentsDir, {
			encoding: 'utf-8',
			cwd: ROOT_DIR,
		} );

		const files = [ ...staged.split( '\n' ), ...unstaged.split( '\n' ) ].filter( Boolean );

		// Extract unique component directory names
		const components = new Set();
		for ( const file of files ) {
			const match = file.match( /client\/dashboard\/components\/([^/]+)/ );
			if ( match ) {
				components.add( match[ 1 ] );
			}
		}

		return Array.from( components );
	} catch {
		return [];
	}
}

/**
 * Find pages that import a specific component.
 */
async function findPagesUsingComponent( componentName ) {
	const pages = new Set();
	const searchDirs = [ 'sites', 'me' ];

	for ( const searchDir of searchDirs ) {
		const dirPath = resolve( DASHBOARD_DIR, searchDir );
		if ( ! existsSync( dirPath ) ) {
			continue;
		}

		try {
			const output = execSync(
				`grep -rl "from '.*components/${ componentName }'" "${ dirPath }" --include="*.tsx" 2>/dev/null || true`,
				{ encoding: 'utf-8' }
			);

			for ( const file of output.split( '\n' ).filter( Boolean ) ) {
				// Extract page directory (e.g., sites/performance from sites/performance/index.tsx)
				const match = file.match( /client\/dashboard\/((?:sites|me)\/[^/]+)/ );
				if ( match ) {
					pages.add( match[ 1 ] );
				}
			}
		} catch {
			// grep returns non-zero if no matches
		}
	}

	return Array.from( pages );
}

async function main() {
	console.log( 'Dashboard Component Screenshot Tool\n' );
	console.log( '='.repeat( 50 ) + '\n' );

	console.log( 'Building route map from router files...' );
	const routeMap = await buildRouteMap();
	console.log( `Found ${ routeMap.size } route mappings\n` );

	console.log( 'Finding modified components...' );
	const modifiedComponents = getModifiedComponents();

	if ( modifiedComponents.length === 0 ) {
		console.log( 'No modified components found in client/dashboard/components/' );
		console.log( '\nTo test, modify a component file and run this script again.' );
		process.exit( 0 );
	}

	console.log( `Modified components: ${ modifiedComponents.join( ', ' ) }\n` );

	// Find all affected pages
	const affectedPages = new Set();
	for ( const component of modifiedComponents ) {
		console.log( `Finding pages using "${ component }"...` );
		const pages = await findPagesUsingComponent( component );
		for ( const page of pages ) {
			affectedPages.add( page );
			console.log( `  - ${ page }` );
		}
	}

	if ( affectedPages.size === 0 ) {
		console.log( '\nNo pages found using the modified components.' );
		process.exit( 0 );
	}

	// Map pages to routes
	const routes = [];
	console.log( '\nMapping pages to routes:' );
	for ( const page of affectedPages ) {
		const route = routeMap.get( page );
		if ( route ) {
			routes.push( route );
			console.log( `  ${ page } -> ${ route }` );
		} else {
			console.log( `  ${ page } -> (no route mapping found)` );
		}
	}

	if ( routes.length === 0 ) {
		console.log( '\nNo routes could be determined for affected pages.' );
		process.exit( 0 );
	}

	// Create output directory
	if ( ! existsSync( OUTPUT_DIR ) ) {
		await mkdir( OUTPUT_DIR, { recursive: true } );
	}

	// Launch browser and take screenshots
	console.log( '\nLaunching browser...' );
	const browser = await chromium.launch( { headless: true } );
	const context = await browser.newContext( {
		viewport: { width: 1280, height: 720 },
	} );
	const page = await context.newPage();

	let siteSlug = SITE_SLUG;

	// Get first site slug if not provided
	if ( ! siteSlug && routes.some( ( r ) => r.includes( '$siteSlug' ) ) ) {
		console.log( 'No SCREENSHOT_SITE_SLUG provided, fetching first available site...' );
		try {
			await page.goto( BASE_URL );
			await page.waitForLoadState( 'networkidle' );
			const currentUrl = page.url();
			const match = currentUrl.match( /\/sites\/([^/]+)/ );
			if ( match ) {
				siteSlug = match[ 1 ];
				console.log( `Using site: ${ siteSlug }` );
			} else {
				console.log( 'Could not determine site slug from URL. Please set SCREENSHOT_SITE_SLUG.' );
			}
		} catch ( err ) {
			console.log( `Could not fetch site list: ${ err.message }` );
			console.log( 'Make sure the dev server is running at ' + BASE_URL );
		}
	}

	console.log( '\nCapturing screenshots:' );
	const capturedFiles = [];

	for ( const route of routes ) {
		const resolvedRoute = route.replace( /\$siteSlug/g, siteSlug );
		console.log( `  ${ resolvedRoute }...` );

		try {
			await page.goto( `${ BASE_URL }${ resolvedRoute }` );
			await page.waitForLoadState( 'networkidle' );
			await page.waitForTimeout( 500 ); // Allow animations to settle

			const filename =
				resolvedRoute
					.replace( /^\//, '' )
					.replace( /\//g, '_' )
					.replace( /[^a-zA-Z0-9_-]/g, '' ) || 'home';

			const filepath = `${ OUTPUT_DIR }/${ filename }.jpg`;

			await page.screenshot( {
				path: filepath,
				fullPage: true,
				type: 'jpeg',
				quality: 80,
			} );

			capturedFiles.push( filepath );
			console.log( `    Saved: ${ filename }.jpg` );
		} catch ( err ) {
			console.error( `    Error: ${ err.message }` );
		}
	}

	await browser.close();

	console.log( '\n' + '='.repeat( 50 ) );
	console.log( `\nScreenshots saved to ${ OUTPUT_DIR }/` );
	console.log( `Captured ${ capturedFiles.length } screenshot(s)` );
}

main().catch( ( err ) => {
	console.error( 'Error:', err.message );
	process.exit( 1 );
} );
