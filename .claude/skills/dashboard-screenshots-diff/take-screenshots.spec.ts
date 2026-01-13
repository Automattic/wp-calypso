import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const SCREENSHOT_DIR = path.join( __dirname, 'screenshots' );
const AUTH_STATE_PATH = path.join( __dirname, 'auth-state.json' );
const BASE_URL = process.env.DASHBOARD_BASE_URL || 'http://my.localhost:3000';
const IS_PRODUCTION = BASE_URL.includes( 'wordpress.com' );

test.use( {
	baseURL: BASE_URL,
	viewport: { width: 1440, height: 900 },
	storageState: fs.existsSync( AUTH_STATE_PATH ) ? AUTH_STATE_PATH : undefined,
} );

// ============================================================================
// Route Types and Extraction
// ============================================================================

interface Route {
	path: string;
	category: 'sites' | 'domains' | 'emails' | 'plugins' | 'me';
	hasParams: boolean;
	params: string[];
}

interface RouteDefinition {
	name: string;
	path: string;
	parentName: string | null;
}

const ROUTER_FILES: Record< Route[ 'category' ], string > = {
	sites: 'client/dashboard/app/router/sites.tsx',
	domains: 'client/dashboard/app/router/domains.ts',
	emails: 'client/dashboard/app/router/emails.tsx',
	plugins: 'client/dashboard/app/router/plugins.tsx',
	me: 'client/dashboard/app/router/me.tsx',
};

function extractRouteDefinitions( content: string ): RouteDefinition[] {
	const routes: RouteDefinition[] = [];
	const lines = content.split( '\n' );
	let currentRouteName: string | null = null;
	let currentPath: string | null = null;
	let currentParent: string | null = null;
	let braceDepth = 0;
	let inCreateRoute = false;

	for ( const line of lines ) {
		const routeStart = line.match( /export\s+const\s+(\w+)\s*=\s*createRoute\s*\(/ );
		if ( routeStart ) {
			if ( currentRouteName && currentPath !== null ) {
				routes.push( {
					name: currentRouteName,
					path: currentPath,
					parentName: currentParent === 'rootRoute' ? null : currentParent,
				} );
			}
			currentRouteName = routeStart[ 1 ];
			currentPath = null;
			currentParent = null;
			inCreateRoute = true;
			braceDepth = 0;
		}

		if ( inCreateRoute ) {
			braceDepth += ( line.match( /\{/g ) || [] ).length;
			braceDepth -= ( line.match( /\}/g ) || [] ).length;
			const pathMatch = line.match( /path:\s*['"`]([^'"`]+)['"`]/ );
			if ( pathMatch ) currentPath = pathMatch[ 1 ];
			const parentMatch = line.match( /getParentRoute:\s*\(\)\s*=>\s*(\w+)/ );
			if ( parentMatch ) currentParent = parentMatch[ 1 ];
			if ( braceDepth <= 0 && ( line.includes( ')' ) || line.includes( '.lazy' ) ) ) {
				inCreateRoute = false;
			}
		}
	}

	if ( currentRouteName && currentPath !== null ) {
		routes.push( {
			name: currentRouteName,
			path: currentPath,
			parentName: currentParent === 'rootRoute' ? null : currentParent,
		} );
	}
	return routes;
}

function buildFullPaths( definitions: RouteDefinition[] ): Map< string, string > {
	const routeMap = new Map< string, RouteDefinition >();
	for ( const def of definitions ) routeMap.set( def.name, def );
	const fullPaths = new Map< string, string >();

	function resolveFullPath( routeName: string, visited: Set< string > = new Set() ): string {
		if ( fullPaths.has( routeName ) ) return fullPaths.get( routeName )!;
		if ( visited.has( routeName ) ) return '';
		visited.add( routeName );
		const route = routeMap.get( routeName );
		if ( ! route ) return '';

		let fullPath: string;
		if ( route.parentName && routeMap.has( route.parentName ) ) {
			const parentPath = resolveFullPath( route.parentName, visited );
			if ( route.path === '/' ) fullPath = parentPath || '/';
			else if ( route.path.startsWith( '/' ) ) fullPath = `${ parentPath }${ route.path }`;
			else fullPath = `${ parentPath }/${ route.path }`.replace( /\/+/g, '/' );
		} else {
			fullPath = route.path.startsWith( '/' ) ? route.path : `/${ route.path }`;
		}
		fullPaths.set( routeName, fullPath );
		return fullPath;
	}

	for ( const def of definitions ) resolveFullPath( def.name );
	return fullPaths;
}

async function extractRoutes( repoRoot: string ): Promise< Route[] > {
	const routes: Route[] = [];
	for ( const [ category, relativePath ] of Object.entries( ROUTER_FILES ) ) {
		const filePath = path.join( repoRoot, relativePath );
		if ( ! fs.existsSync( filePath ) ) continue;
		const content = fs.readFileSync( filePath, 'utf-8' );
		const definitions = extractRouteDefinitions( content );
		const fullPaths = buildFullPaths( definitions );

		for ( const [ , fullPath ] of fullPaths ) {
			if ( fullPath === '/' || fullPath === '' ) continue;
			const paramMatches = fullPath.match( /\$\w+/g ) || [];
			routes.push( {
				path: fullPath,
				category: category as Route[ 'category' ],
				hasParams: paramMatches.length > 0,
				params: paramMatches.map( ( p ) => p.slice( 1 ) ),
			} );
		}
	}
	routes.sort( ( a, b ) => a.path.localeCompare( b.path ) );
	const seen = new Set< string >();
	return routes.filter( ( r ) => ! seen.has( r.path ) && seen.add( r.path ) );
}

function substituteParams( route: Route, params: Record< string, string > ): string {
	let routePath = route.path;
	for ( const param of route.params ) {
		if ( params[ param ] ) routePath = routePath.replace( `$${ param }`, params[ param ] );
	}
	return routePath;
}

function getChangedDashboardFiles( repoRoot: string, baseBranch: string = 'trunk' ): string[] {
	const files = new Set< string >();
	try {
		execSync( `git diff --name-only ${ baseBranch }...HEAD -- 'client/dashboard/**'`, {
			cwd: repoRoot,
			encoding: 'utf-8',
		} )
			.trim()
			.split( '\n' )
			.filter( Boolean )
			.forEach( ( f ) => files.add( f ) );
	} catch {
		/* ignore */
	}
	try {
		execSync( `git diff --name-only ${ baseBranch } -- 'client/dashboard/**'`, {
			cwd: repoRoot,
			encoding: 'utf-8',
		} )
			.trim()
			.split( '\n' )
			.filter( Boolean )
			.forEach( ( f ) => files.add( f ) );
	} catch {
		/* ignore */
	}
	return Array.from( files );
}

function filePathToRoutePaths( filePath: string ): string[] {
	const rel = filePath.replace( /^client\/dashboard\//, '' );
	if ( rel.startsWith( 'app-dotcom/' ) || rel.startsWith( 'app-ciab/' ) ) return [ '/sites' ];
	if ( /^(app|components|utils|hooks|types)\//.test( rel ) ) return [];

	const parts = rel.split( '/' );
	const routeParts: string[] = [];
	for ( const part of parts ) {
		if ( part.includes( '.' ) ) {
			const name = part.replace( /\.(tsx?|jsx?|css|scss)$/, '' );
			if ( ! [ 'index', 'style', 'styles' ].includes( name ) && ! name.startsWith( 'test' ) )
				routeParts.push( name );
			break;
		}
		routeParts.push( part );
	}
	if ( ! routeParts.length ) return [];

	const routes: string[] = [];
	if ( routeParts[ 0 ] === 'sites' ) {
		routes.push( '/sites', '/sites/$siteSlug' );
		if ( routeParts.length > 1 )
			routes.push( `/sites/$siteSlug/${ routeParts.slice( 1 ).join( '/' ) }` );
	} else if ( routeParts[ 0 ] === 'domains' ) {
		routes.push( '/domains' );
		if ( routeParts.length > 1 )
			routes.push(
				`/domains/$domainName/${ routeParts.slice( 1 ).join( '/' ) }`,
				'/domains/$domainName'
			);
	} else {
		routes.push( '/' + routeParts.join( '/' ) );
		for ( let i = routeParts.length - 1; i > 0; i-- )
			routes.push( '/' + routeParts.slice( 0, i ).join( '/' ) );
	}
	return routes;
}

async function getAffectedRoutes(
	repoRoot: string,
	allRoutes: Route[],
	baseBranch: string = 'trunk'
): Promise< Route[] > {
	const changedFiles = getChangedDashboardFiles( repoRoot, baseBranch );
	if ( ! changedFiles.length ) return [];
	const potentialPaths = new Set< string >();
	changedFiles.forEach( ( f ) =>
		filePathToRoutePaths( f ).forEach( ( p ) => potentialPaths.add( p ) )
	);
	return allRoutes.filter( ( r ) => potentialPaths.has( r.path ) );
}

// ============================================================================
// Helpers
// ============================================================================

function findRepoRoot( startDir: string ): string | null {
	let dir = startDir;
	while ( dir !== '/' ) {
		const pkgPath = path.join( dir, 'package.json' );
		if ( fs.existsSync( pkgPath ) ) {
			try {
				if ( JSON.parse( fs.readFileSync( pkgPath, 'utf-8' ) ).name === 'wp-calypso' ) return dir;
			} catch {
				/* ignore */
			}
		}
		dir = path.dirname( dir );
	}
	return null;
}

function getCurrentBranch(): string {
	try {
		const head = fs.readFileSync(
			path.join( findRepoRoot( __dirname ) || __dirname, '.git', 'HEAD' ),
			'utf-8'
		);
		const match = head.match( /ref: refs\/heads\/(.+)/ );
		return match ? match[ 1 ].trim() : 'unknown';
	} catch {
		return 'unknown';
	}
}

function pathToFilename( routePath: string ): string {
	return (
		routePath
			.replace( /^\//, '' )
			.replace( /\//g, '-' )
			.replace( /[^a-zA-Z0-9-_.]/g, '' ) || 'index'
	);
}

async function getRoutesToScreenshot(): Promise< Route[] > {
	const repoRoot = process.env.REPO_ROOT || findRepoRoot( __dirname );
	if ( ! repoRoot ) throw new Error( 'Could not find wp-calypso repo root.' );

	if ( process.env.SCREENSHOT_ROUTES ) {
		return process.env.SCREENSHOT_ROUTES.split( ',' )
			.map( ( p ) => p.trim() )
			.map( ( p ) => ( {
				path: p,
				category: 'sites' as const,
				hasParams: p.includes( '$' ),
				params: ( p.match( /\$(\w+)/g ) || [] ).map( ( m ) => m.slice( 1 ) ),
			} ) );
	}

	const allRoutes = await extractRoutes( repoRoot );
	const baseBranch = process.env.BASE_BRANCH || 'trunk';
	const changedFiles = getChangedDashboardFiles( repoRoot, baseBranch );

	if ( ! changedFiles.length ) {
		console.log( `\nNo dashboard files changed compared to ${ baseBranch }` );
		return [];
	}

	console.log( `\nChanged files (vs ${ baseBranch }):` );
	changedFiles.forEach( ( f ) => console.log( `  - ${ f }` ) );

	const affected = await getAffectedRoutes( repoRoot, allRoutes, baseBranch );
	console.log( `\nMapped to ${ affected.length } routes\n` );
	return affected;
}

// ============================================================================
// Test
// ============================================================================

test.describe( 'Dashboard Screenshots', () => {
	const branch = process.env.SCREENSHOT_BRANCH || getCurrentBranch();
	const outputDir = path.join( SCREENSHOT_DIR, branch );
	const relOutputDir = `.claude/skills/dashboard-screenshots-diff/screenshots/${ branch }`;

	test.beforeAll( () => {
		fs.mkdirSync( outputDir, { recursive: true } );
		console.log( `\nScreenshots: ${ relOutputDir }\n` );
	} );

	test( 'Take screenshots', async ( { page } ) => {
		const routes = await getRoutesToScreenshot();
		const params = {
			siteSlug: process.env.SITE_SLUG || '',
			domainName: process.env.DOMAIN_NAME || '',
		};

		const skipped: string[] = [],
			captured: string[] = [];

		for ( const route of routes ) {
			const missing = route.params.filter( ( p ) => ! params[ p as keyof typeof params ] );
			if ( missing.length ) {
				skipped.push( `${ route.path } (missing: ${ missing.join( ', ' ) })` );
				continue;
			}

			const fullPath = substituteParams( route, params );
			const filename = `${ pathToFilename( fullPath ) }.png`;
			console.log( `Capturing: ${ fullPath }` );

			try {
				await page.goto( fullPath, { waitUntil: 'domcontentloaded' } );
				await page.waitForLoadState( 'load' );
				await page.waitForTimeout( 1000 );
				try {
					await page.waitForSelector( '[class*="loading"], [class*="spinner"]', {
						state: 'hidden',
						timeout: 5000,
					} );
				} catch {
					/* ok */
				}
				await page.screenshot( { path: path.join( outputDir, filename ), fullPage: true } );
				captured.push( fullPath );
				console.log( `  -> ${ filename }` );
			} catch ( e ) {
				skipped.push( `${ fullPath } (error)` );
			}
		}

		console.log( `\nCaptured: ${ captured.length }, Skipped: ${ skipped.length }` );
		console.log( `Output: ${ relOutputDir }\n` );
	} );
} );
