/**
 * @jest-environment node
 */
import path from 'path';
import { LegacyESLint } from 'eslint/use-at-your-own-risk';
import packageJson from '../../package.json';

const repoRoot = path.resolve( __dirname, '../../../..' );
const filePath = path.join( repoRoot, 'packages/checkout/src/boundary-fixture.ts' );

const BOUNDARY_RULES = [ 'no-restricted-imports', 'no-restricted-modules', 'no-restricted-syntax' ];

const eslint = new LegacyESLint( { cwd: repoRoot } );

async function lint( source: string ) {
	const [ result ] = await eslint.lintText( source, { filePath } );
	return result.messages;
}

async function boundaryErrors( source: string ) {
	return ( await lint( source ) ).filter( ( { ruleId } ) =>
		BOUNDARY_RULES.includes( ruleId ?? '' )
	);
}

describe( 'import boundary', () => {
	it.each( [
		[ 'calypso/state', "import { getSelectedSite } from 'calypso/state/ui/selectors';" ],
		[ 'calypso/lib', "import wpcom from 'calypso/lib/wp';" ],
		[ 'client', "import { thing } from 'client/my-sites/checkout/src/thing';" ],
		[ 'redux', "import { createStore } from 'redux';" ],
		[ 'react-redux', "import { useSelector } from 'react-redux';" ],
		[ 'redux-thunk', "import thunk from 'redux-thunk';" ],
		[ 'a redux submodule', "import { createStore } from 'redux/es/redux';" ],
		[ 'redux through require', "const { createStore } = require( 'redux/es/redux' );" ],
		[ 'redux through import()', "const { createStore } = await import( 'redux' );" ],
		[ 'a redux submodule through import()', "const store = await import( 'redux/es/redux' );" ],
		[ 'calypso through import()', "const wpcom = await import( 'calypso/lib/wp' );" ],
	] )( 'rejects importing %s', async ( _name, source ) => {
		expect( await boundaryErrors( source ) ).not.toHaveLength( 0 );
	} );

	it.each( [
		[ '@automattic/api-queries', "import { queryClient } from '@automattic/api-queries';" ],
		[ '@tanstack/react-query', "import { useQuery } from '@tanstack/react-query';" ],
		[ 'react', "import { useState } from 'react';" ],
		[ 'a lazy chunk of its own', "const step = await import( './contact-step' );" ],
	] )( 'allows importing %s', async ( _name, source ) => {
		expect( await boundaryErrors( source ) ).toHaveLength( 0 );
	} );

	// The lint rules only see source text, so a forbidden module could still
	// arrive as a declared dependency.
	it( 'declares no dependency on the legacy app or Redux', () => {
		const dependencies = Object.keys( {
			...packageJson.dependencies,
			...( packageJson as { peerDependencies?: Record< string, string > } ).peerDependencies,
		} );

		expect(
			dependencies.filter( ( name ) => /^(redux|react-redux|redux-thunk)$/.test( name ) )
		).toEqual( [] );
	} );
} );
