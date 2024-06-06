/**
 * @jest-environment jsdom
 */

import { getImporterEngines } from '../importer-config';

describe( 'importer-config', () => {
	test( 'It retrieves the importer engines', () => {
		const importerEngines = getImporterEngines();

		expect( Array.isArray( importerEngines ) ).toBeTruthy();
		expect( importerEngines.every( ( item ) => typeof item === 'string' ) ).toBeTruthy();
	} );
} );
