/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import { ALLOWED_ORIGINS } from '../sign-in-with-apple';

describe( 'sign-in-with-apple ALLOWED_ORIGINS', () => {
	test( 'matches dashboard-production hostname_allowlist', () => {
		const dashboardProd = JSON.parse(
			fs.readFileSync(
				path.resolve( __dirname, '..', '..', '..', '..', 'config', 'dashboard-production.json' ),
				'utf8'
			)
		);

		const origins = ALLOWED_ORIGINS.map( ( url ) => new URL( url ).hostname );

		expect( origins.sort() ).toEqual( [ ...dashboardProd.hostname_allowlist ].sort() );
	} );
} );
