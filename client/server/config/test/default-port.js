import fs from 'fs';
import os from 'os';
import path from 'path';
import {
	MAIN_CHECKOUT_PORT,
	WORKTREE_PORT_COUNT,
	WORKTREE_PORT_START,
	getDefaultPort,
} from '@automattic/calypso-config/default-port';

describe( 'getDefaultPort', () => {
	let tmpDir;

	function makeCheckout( name, gitEntry ) {
		const root = path.join( tmpDir, name );
		fs.mkdirSync( root );
		if ( gitEntry === 'dir' ) {
			fs.mkdirSync( path.join( root, '.git' ) );
		} else if ( gitEntry === 'file' ) {
			fs.writeFileSync( path.join( root, '.git' ), `gitdir: /repo/.git/worktrees/${ name }\n` );
		}
		return root;
	}

	beforeEach( () => {
		tmpDir = fs.mkdtempSync( path.join( os.tmpdir(), 'default-port-' ) );
	} );

	afterEach( () => {
		fs.rmSync( tmpDir, { recursive: true, force: true } );
	} );

	test( 'should be 3000 in the main checkout', () => {
		expect( getDefaultPort( makeCheckout( 'main', 'dir' ) ) ).toBe( MAIN_CHECKOUT_PORT );
		expect( MAIN_CHECKOUT_PORT ).toBe( 3000 );
	} );

	test( 'should be 3000 outside a git checkout', () => {
		expect( getDefaultPort( makeCheckout( 'image' ) ) ).toBe( MAIN_CHECKOUT_PORT );
	} );

	test( 'should be in the worktree range in a linked worktree', () => {
		const port = getDefaultPort( makeCheckout( 'worktree', 'file' ) );

		expect( Number.isInteger( port ) ).toBe( true );
		expect( port ).toBeGreaterThanOrEqual( WORKTREE_PORT_START );
		expect( port ).toBeLessThan( WORKTREE_PORT_START + WORKTREE_PORT_COUNT );
	} );

	test( 'should be stable for a worktree', () => {
		const root = makeCheckout( 'worktree', 'file' );

		expect( getDefaultPort( root ) ).toBe( getDefaultPort( root ) );
	} );

	test( 'should be the same through a symlink to the worktree', () => {
		const root = makeCheckout( 'worktree', 'file' );
		const link = path.join( tmpDir, 'link' );
		fs.symlinkSync( root, link );

		expect( getDefaultPort( link ) ).toBe( getDefaultPort( root ) );
	} );

	test( 'should spread worktrees over the range', () => {
		const ports = new Set();
		for ( let i = 0; i < 20; i++ ) {
			ports.add( getDefaultPort( makeCheckout( `worktree-${ i }`, 'file' ) ) );
		}

		expect( ports.size ).toBeGreaterThan( 15 );
	} );
} );
