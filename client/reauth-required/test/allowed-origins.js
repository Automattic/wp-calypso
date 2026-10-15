/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import { ALLOWED_ORIGINS } from '../component';

describe( 'reauth-required ALLOWED_ORIGINS', () => {
	test( 'matches the dashboard-production hostname_allowlist', () => {
		const { hostname_allowlist: allowlist } = JSON.parse(
			fs.readFileSync(
				path.resolve( __dirname, '..', '..', '..', 'config', 'dashboard-production.json' ),
				'utf8'
			)
		);

		const hostnames = ALLOWED_ORIGINS.map( ( url ) => new URL( url ).hostname );

		expect( hostnames.sort() ).toEqual( [ ...allowlist ].sort() );
	} );
} );
