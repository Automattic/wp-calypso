#!/usr/bin/env node

/**
 * Dashboard PR Screenshots
 *
 * Captures before/after screenshots of dashboard routes for visual comparison in PRs.
 * Uses calypso.live preview URLs to capture screenshots from trunk and the PR branch.
 *
 * Usage:
 *   node bin/dashboard-pr-screenshots.mjs --routes "/sites,/me/profile"
 *   node bin/dashboard-pr-screenshots.mjs --routes "/sites/$siteSlug" --site-slug "example.wordpress.com"
 *   node bin/dashboard-pr-screenshots.mjs --viewport mobile
 *
 * Environment variables:
 *   CALYPSO_LIVE_USER - Username for calypso.live authentication
 *   CALYPSO_LIVE_PASSWORD - Password for calypso.live authentication
 *   GITHUB_HEAD_REF - PR branch name (set by GitHub Actions)
 *
 * Output:
 *   Screenshots saved to ./screenshots/dashboard-pr/
 *   Markdown file at ./screenshots/dashboard-pr/comparison.md
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

// Configuration
const SCREENSHOT_DIR = './screenshots/dashboard-pr';
const VIEWPORTS = {
	desktop: { width: 1280, height: 800 },
	tablet: { width: 768, height: 1024 },
	mobile: { width: 375, height: 812 },
};

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
 * Get calypso.live URL for a branch
 */
function getCalypsoLiveUrl( branch, route ) {
	const baseUrl = 'https://calypso.live';
	const params = new URLSearchParams( {
		branch: branch === 'trunk' ? 'trunk' : branch,
	} );
	return `${ baseUrl }${ route }?${ params.toString() }`;
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
	return route
		.replace( /^\//, '' )
		.replace( /\//g, '_' )
		.replace( /[^a-zA-Z0-9_-]/g, '' ) || 'index';
}

/**
 * Authenticate with calypso.live (WordPress.com login)
 */
async function authenticate( page, username, password ) {
	console.log( 'Authenticating with WordPress.com...' );

	// Navigate to login page
	await page.goto( 'https://wordpress.com/log-in' );
	await page.waitForLoadState( 'networkidle' );

	// Fill in credentials
	await page.fill( 'input[name="usernameOrEmail"]', username );
	await page.click( 'button[type="submit"]' );

	// Wait for password field and fill it
	await page.waitForSelector( 'input[name="password"]', { timeout: 10000 } );
	await page.fill( 'input[name="password"]', password );
	await page.click( 'button[type="submit"]' );

	// Wait for login to complete
	await page.waitForURL( /wordpress\.com/, { timeout: 30000 } );
	console.log( 'Authentication successful' );
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
		console.warn( 'Main content selector not found, proceeding anyway' );
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
	let username = process.env.CALYPSO_LIVE_USER;
	let password = process.env.CALYPSO_LIVE_PASSWORD;

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
			case '--username':
				username = args[ ++i ];
				break;
			case '--password':
				password = args[ ++i ];
				break;
		}
	}

	if ( routes.length === 0 ) {
		// Auto-detect routes using route detector
		try {
			const output = execSync( 'node client/dashboard/bin/dashboard-route-detector.mjs', { encoding: 'utf-8' } );
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

	// Create output directories
	const beforeDir = path.join( SCREENSHOT_DIR, 'before' );
	const afterDir = path.join( SCREENSHOT_DIR, 'after' );
	fs.mkdirSync( beforeDir, { recursive: true } );
	fs.mkdirSync( afterDir, { recursive: true } );

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

	// Authenticate if credentials provided
	if ( username && password ) {
		await authenticate( page, username, password );
	} else {
		console.warn( 'No credentials provided, screenshots may show login page' );
	}

	const viewportConfig = VIEWPORTS[ viewport ] || VIEWPORTS.desktop;

	// Capture "before" screenshots (trunk)
	console.log( '\n--- Capturing trunk (before) screenshots ---' );
	for ( const route of routes ) {
		const resolvedRoute = resolveRoute( route, siteSlug, siteSlug );
		const url = getCalypsoLiveUrl( 'trunk', resolvedRoute );
		const filename = routeToFilename( resolvedRoute ) + '.png';
		const outputPath = path.join( beforeDir, filename );

		try {
			await captureScreenshot( page, url, outputPath, viewportConfig );
		} catch ( error ) {
			console.error( `  Failed: ${ error.message }` );
		}
	}

	// Capture "after" screenshots (current branch)
	console.log( '\n--- Capturing branch (after) screenshots ---' );
	for ( const route of routes ) {
		const resolvedRoute = resolveRoute( route, siteSlug, siteSlug );
		const url = getCalypsoLiveUrl( currentBranch, resolvedRoute );
		const filename = routeToFilename( resolvedRoute ) + '.png';
		const outputPath = path.join( afterDir, filename );

		try {
			await captureScreenshot( page, url, outputPath, viewportConfig );
		} catch ( error ) {
			console.error( `  Failed: ${ error.message }` );
		}
	}

	await browser.close();

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
