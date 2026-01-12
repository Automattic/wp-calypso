import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_STATE_PATH = path.join( __dirname, 'auth-state.json' );

test.use( {
	storageState: undefined,
	viewport: { width: 1440, height: 900 },
} );

test( 'Save authentication session', async ( { page, context } ) => {
	await page.goto( 'https://wordpress.com/log-in' );

	console.log( '\n' + '='.repeat( 60 ) );
	console.log( 'MANUAL LOGIN REQUIRED' );
	console.log( '='.repeat( 60 ) );
	console.log( '\n1. Log in to your WordPress.com account' );
	console.log( '2. Complete any 2FA if required' );
	console.log( '3. Wait until you see the dashboard' );
	console.log( '4. Click "Resume" in the Playwright inspector' );
	console.log( '\n' + '='.repeat( 60 ) + '\n' );

	await page.pause();
	await context.storageState( { path: AUTH_STATE_PATH } );

	console.log( '\nSaved to: .claude/skills/dashboard-screenshots-diff/auth-state.json\n' );
} );
