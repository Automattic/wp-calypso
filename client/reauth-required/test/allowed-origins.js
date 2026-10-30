/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import { ALLOWED_ORIGINS } from '../component';

describe( 'reauth-required ALLOWED_ORIGINS', () => {
	test( 'matches the dashboard-production and dashboard-horizon hostname_allowlists', () => {
		const allowlist = new Set(
			[ 'dashboard-production', 'dashboard-horizon' ].flatMap(
				( env ) =>
					JSON.parse(
						fs.readFileSync(
							path.resolve( __dirname, '..', '..', '..', 'config', `${ env }.json` ),
							'utf8'
						)
					).hostname_allowlist
			)
		);

		const hostnames = ALLOWED_ORIGINS.map( ( url ) => new URL( url ).hostname );

		expect( hostnames.sort() ).toEqual( [ ...allowlist ].sort() );
	} );
} );
