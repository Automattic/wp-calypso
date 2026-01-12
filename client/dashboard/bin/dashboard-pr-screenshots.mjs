#!/usr/bin/env node

/**
 * Dashboard PR Screenshots
 *
 * Captures before/after screenshots of dashboard routes for visual comparison in PRs.
 * Uses the same authentication approach as E2E tests via @automattic/calypso-e2e.
 *
 * Usage:
 *   node client/dashboard/bin/dashboard-pr-screenshots.mjs --routes "/sites,/me/profile"
 *   node client/dashboard/bin/dashboard-pr-screenshots.mjs --viewport mobile
 *   node client/dashboard/bin/dashboard-pr-screenshots.mjs --use-running-server
 *
 * Prerequisites:
 *   - E2E secrets decrypted (same as running E2E tests)
 *   - Node.js 18+
 *
 * Output:
 *   Screenshots saved to ./screenshots/dashboard-pr/
 *   Markdown file at ./screenshots/dashboard-pr/comparison.md
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

// Configuration
const SCREENSHOT_DIR = './screenshots/dashboard-pr';
const LOCAL_SERVER_PORT = 3000;
const LOCAL_SERVER_URL = `http://calypso.localhost:${ LOCAL_SERVER_PORT }`;
const VIEWPORTS = {
	desktop: { width: 1280, height: 800 },
	tablet: { width: 768, height: 1024 },
	mobile: { width: 375, height: 812 },
};

// Default test account - same as E2E tests
const DEFAULT_TEST_ACCOUNT = 'defaultUser';

// Default test site slug for routes that need $siteSlug
const DEFAULT_SITE_SLUG = 'e2eflowtestingmobile.wordpress.com';

/**
 * Get the current git branch name
 */
function getCurrentBranch() {
	try {
		return execSync( 'git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' } ).trim();
	} catch {
		return process.env.GITHUB_HEAD_REF || 'unknown';
	}
}

/**
 * Check if there are uncommitted changes
 */
function hasUncommittedChanges() {
	try {
		const status = execSync( 'git status --porcelain', { encoding: 'utf-8' } ).trim();
		return status.length > 0;
	} catch {
		return false;
	}
}

/**
 * Stash uncommitted changes
 */
function stashChanges() {
	console.log( 'Stashing uncommitted changes...' );
	execSync( 'git stash push -m "dashboard-pr-screenshots temporary stash"', { stdio: 'inherit' } );
}

/**
 * Pop stashed changes
 */
function popStash() {
	console.log( 'Restoring stashed changes...' );
	try {
		execSync( 'git stash pop', { stdio: 'inherit' } );
	} catch {
		console.warn( 'No stash to pop or stash pop failed' );
	}
}

/**
 * Checkout a branch
 */
function checkoutBranch( branch ) {
	console.log( `Checking out ${ branch }...` );
	execSync( `git checkout ${ branch }`, { stdio: 'inherit' } );
}

/**
 * Build the dashboard
 */
function buildDashboard() {
	console.log( 'Building dashboard...' );
	execSync( 'yarn workspace @automattic/calypso-dashboard build', {
		stdio: 'inherit',
		env: { ...process.env, NODE_ENV: 'production' },
	} );
}

/**
 * Start the development server
 * Returns the server process
 */
function startServer() {
	console.log( 'Starting development server...' );
	const server = spawn( 'yarn', [ 'start' ], {
		stdio: 'pipe',
		detached: true,
		env: { ...process.env, CALYPSO_ENV: 'development' },
	} );

	return server;
}

/**
 * Wait for server to be ready
 */
async function waitForServer( url, maxWaitMs = 120000 ) {
	console.log( `Waiting for server at ${ url }...` );
	const startTime = Date.now();

	while ( Date.now() - startTime < maxWaitMs ) {
		try {
			const response = await fetch( url, { method: 'HEAD' } );
			if ( response.ok || response.status === 302 || response.status === 401 ) {
				console.log( 'Server is ready!' );
				return true;
			}
		} catch {
			// Server not ready yet
		}
		await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );
	}

	throw new Error( `Server did not start within ${ maxWaitMs / 1000 } seconds` );
}

/**
 * Stop the server process
 */
function stopServer( server ) {
	if ( server && server.pid ) {
		console.log( 'Stopping server...' );
		try {
			// Kill the process group
			process.kill( -server.pid, 'SIGTERM' );
		} catch {
			// Process may already be dead
		}
	}
}

/**
 * Replace route parameters with actual values
 */
function resolveRoute( route, siteSlug, domainSlug ) {
	return route
		.replace( /\$siteSlug/g, siteSlug )
		.replace( /\$domainSlug/g, domainSlug || siteSlug );
}

/**
 * Create a safe filename from a route
 */
function routeToFilename( route ) {
	return (
		route
			.replace( /^\//, '' )
			.replace( /\//g, '_' )
			.replace( /[^a-zA-Z0-9_-]/g, '' ) || 'index'
	);
}

/**
 * Authenticate using E2E test account
 */
async function authenticate( page, accountName ) {
	console.log( `Authenticating with test account: ${ accountName }...` );

	// Import calypso-e2e dynamically
	const { TestAccount } = await import( '@automattic/calypso-e2e' );

	const testAccount = new TestAccount( accountName );
	await testAccount.authenticate( page );

	console.log( 'Authentication successful' );
	return testAccount;
}

/**
 * Capture a screenshot of a route
 */
async function captureScreenshot( page, url, outputPath, viewport ) {
	console.log( `Capturing: ${ url }` );

	await page.setViewportSize( viewport );
	await page.goto( url, { waitUntil: 'networkidle', timeout: 60000 } );

	// Wait for main content to load
	try {
		await page.waitForSelector( '[role="main"], .main, #primary', { timeout: 15000 } );
	} catch {
		console.warn( '  Main content selector not found, proceeding anyway' );
	}

	// Additional wait for lazy-loaded content
	await page.waitForTimeout( 2000 );

	// Take screenshot
	await page.screenshot( {
		path: outputPath,
		fullPage: true,
	} );

	console.log( `  Saved: ${ outputPath }` );
}

/**
 * Capture screenshots for all routes
 */
async function captureAllScreenshots( page, routes, outputDir, siteSlug, viewportConfig ) {
	for ( const route of routes ) {
		const resolvedRoute = resolveRoute( route, siteSlug, siteSlug );
		const url = `${ LOCAL_SERVER_URL }${ resolvedRoute }`;
		const filename = routeToFilename( resolvedRoute ) + '.png';
		const outputPath = path.join( outputDir, filename );

		try {
			await captureScreenshot( page, url, outputPath, viewportConfig );
		} catch ( error ) {
			console.error( `  Failed: ${ error.message }` );
		}
	}
}

/**
 * Generate markdown comparison table
 */
function generateMarkdown( routes, beforeDir, afterDir, siteSlug ) {
	let markdown = '## Visual Regression\n\n';
	markdown += '| Route | Before | After |\n';
	markdown += '|-------|--------|-------|\n';

	for ( const route of routes ) {
		const resolvedRoute = resolveRoute( route, siteSlug, siteSlug );
		const filename = routeToFilename( resolvedRoute ) + '.png';
		const beforePath = path.join( beforeDir, filename );
		const afterPath = path.join( afterDir, filename );

		// Check if files exist
		const beforeExists = fs.existsSync( beforePath );
		const afterExists = fs.existsSync( afterPath );

		if ( beforeExists && afterExists ) {
			markdown += `| \`${ resolvedRoute }\` | ![before](${ beforePath }) | ![after](${ afterPath }) |\n`;
		} else if ( ! beforeExists && afterExists ) {
			markdown += `| \`${ resolvedRoute }\` | (new) | ![after](${ afterPath }) |\n`;
		} else if ( beforeExists && ! afterExists ) {
			markdown += `| \`${ resolvedRoute }\` | ![before](${ beforePath }) | (removed) |\n`;
		}
	}

	markdown += '\n<details>\n<summary>Full-size comparisons</summary>\n\n';

	for ( const route of routes ) {
		const resolvedRoute = resolveRoute( route, siteSlug, siteSlug );
		const filename = routeToFilename( resolvedRoute ) + '.png';
		const beforePath = path.join( beforeDir, filename );
		const afterPath = path.join( afterDir, filename );

		if ( fs.existsSync( beforePath ) && fs.existsSync( afterPath ) ) {
			markdown += `### ${ resolvedRoute }\n\n`;
			markdown += '| Before | After |\n';
			markdown += '|--------|-------|\n';
			markdown += `| ![before](${ beforePath }) | ![after](${ afterPath }) |\n\n`;
		}
	}

	markdown += '</details>\n\n';
	markdown += '---\n';
	markdown += '*Generated by `/dashboard-pr-screenshots` skill*\n';

	return markdown;
}

/**
 * Main function
 */
async function main() {
	// Parse arguments
	const args = process.argv.slice( 2 );
	let routes = [];
	let viewport = 'desktop';
	let siteSlug = DEFAULT_SITE_SLUG;
	let accountName = DEFAULT_TEST_ACCOUNT;
	let skipBuild = false;
	let useRunningServer = false;

	for ( let i = 0; i < args.length; i++ ) {
		switch ( args[ i ] ) {
			case '--routes':
				routes = args[ ++i ].split( ',' ).map( ( r ) => r.trim() );
				break;
			case '--viewport':
				viewport = args[ ++i ];
				break;
			case '--site-slug':
				siteSlug = args[ ++i ];
				break;
			case '--account':
				accountName = args[ ++i ];
				break;
			case '--skip-build':
				skipBuild = true;
				break;
			case '--use-running-server':
				useRunningServer = true;
				break;
		}
	}

	if ( routes.length === 0 ) {
		// Auto-detect routes using route detector
		try {
			const output = execSync( 'node client/dashboard/bin/dashboard-route-detector.mjs', {
				encoding: 'utf-8',
			} );
			routes = JSON.parse( output );
		} catch ( error ) {
			console.error( 'Failed to detect routes:', error.message );
			console.log( 'Please specify routes with --routes "/sites,/me/profile"' );
			process.exit( 1 );
		}
	}

	if ( routes.length === 0 ) {
		console.log( 'No routes to screenshot' );
		process.exit( 0 );
	}

	console.log( 'Routes to screenshot:', routes );

	// Get current branch
	const currentBranch = getCurrentBranch();
	console.log( 'Current branch:', currentBranch );

	if ( currentBranch === 'trunk' ) {
		console.error( 'Error: Cannot compare trunk to itself. Please run from a feature branch.' );
		process.exit( 1 );
	}

	// Create output directories
	const beforeDir = path.join( SCREENSHOT_DIR, 'before' );
	const afterDir = path.join( SCREENSHOT_DIR, 'after' );
	fs.mkdirSync( beforeDir, { recursive: true } );
	fs.mkdirSync( afterDir, { recursive: true } );

	// Check for uncommitted changes
	const hadChanges = hasUncommittedChanges();
	if ( hadChanges && ! useRunningServer ) {
		stashChanges();
	}

	// Launch browser
	const browser = await chromium.launch( { headless: true } );
	const context = await browser.newContext();

	// Set cookie consent to avoid popups
	await context.addCookies( [
		{
			name: 'sensitive_pixel_options',
			value: '{"ok":true,"buckets":{"essential":true,"analytics":false,"advertising":false}}',
			domain: '.wordpress.com',
			path: '/',
		},
	] );

	const page = await context.newPage();

	// Authenticate using E2E test account
	try {
		await authenticate( page, accountName );
	} catch ( error ) {
		console.warn( `Authentication failed: ${ error.message }` );
		console.warn( 'Continuing without authentication - screenshots may show login page' );
		console.warn( 'Make sure E2E secrets are decrypted (same setup as E2E tests)' );
	}

	const viewportConfig = VIEWPORTS[ viewport ] || VIEWPORTS.desktop;

	let server = null;

	try {
		if ( useRunningServer ) {
			// Use already running server - just capture current state as "after"
			console.log( '\n--- Using running server mode ---' );
			console.log( 'Assuming server is already running at', LOCAL_SERVER_URL );

			// Capture "after" screenshots (current branch with running server)
			console.log( '\n--- Capturing current branch (after) screenshots ---' );
			await captureAllScreenshots( page, routes, afterDir, siteSlug, viewportConfig );

			console.log( '\n--- Switching to trunk for before screenshots ---' );
			checkoutBranch( 'trunk' );

			// Wait a bit for any hot reload
			await new Promise( ( resolve ) => setTimeout( resolve, 5000 ) );

			// Capture "before" screenshots (trunk)
			console.log( '\n--- Capturing trunk (before) screenshots ---' );
			await captureAllScreenshots( page, routes, beforeDir, siteSlug, viewportConfig );

			// Switch back to feature branch
			checkoutBranch( currentBranch );
		} else {
			// Full build mode
			// Checkout trunk and build
			console.log( '\n--- Building trunk (before) ---' );
			checkoutBranch( 'trunk' );

			if ( ! skipBuild ) {
				buildDashboard();
			}

			server = startServer();
			await waitForServer( LOCAL_SERVER_URL );

			// Capture "before" screenshots
			console.log( '\n--- Capturing trunk (before) screenshots ---' );
			await captureAllScreenshots( page, routes, beforeDir, siteSlug, viewportConfig );

			stopServer( server );
			server = null;

			// Checkout feature branch and build
			console.log( '\n--- Building feature branch (after) ---' );
			checkoutBranch( currentBranch );

			if ( ! skipBuild ) {
				buildDashboard();
			}

			server = startServer();
			await waitForServer( LOCAL_SERVER_URL );

			// Capture "after" screenshots
			console.log( '\n--- Capturing branch (after) screenshots ---' );
			await captureAllScreenshots( page, routes, afterDir, siteSlug, viewportConfig );

			stopServer( server );
			server = null;
		}
	} finally {
		// Cleanup
		if ( server ) {
			stopServer( server );
		}
		await browser.close();

		// Restore stashed changes if we had any
		if ( hadChanges && ! useRunningServer ) {
			popStash();
		}
	}

	// Generate comparison markdown
	const markdown = generateMarkdown( routes, beforeDir, afterDir, siteSlug );
	const markdownPath = path.join( SCREENSHOT_DIR, 'comparison.md' );
	fs.writeFileSync( markdownPath, markdown );
	console.log( `\nComparison markdown saved to: ${ markdownPath }` );

	// Output summary
	console.log( '\n--- Summary ---' );
	console.log( `Screenshots saved to: ${ SCREENSHOT_DIR }` );
	console.log( `Before: ${ beforeDir }` );
	console.log( `After: ${ afterDir }` );
	console.log( `Comparison: ${ markdownPath }` );
}

main().catch( ( error ) => {
	console.error( 'Error:', error );
	process.exit( 1 );
} );
