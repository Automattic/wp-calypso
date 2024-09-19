/**
 * @jest-environment jsdom
 */

import { getImporterEngines, getImportersAsImporterOption } from '../importer-config';

describe( 'importer-config', () => {
	test( 'It retrieves the importer engines', () => {
		const importerEngines = getImporterEngines();

		expect( Array.isArray( importerEngines ) ).toBeTruthy();
		expect( importerEngines.every( ( item ) => typeof item === 'string' ) ).toBeTruthy();
	} );

	test( 'It retrieves the importer primary configs as ImporterOptions', () => {
		const importerOptions = getImportersAsImporterOption( 'primary' );

		expect( Array.isArray( importerOptions ) ).toBeTruthy();
		expect( importerOptions.length ).toBeGreaterThan( 0 );
		expect( importerOptions.every( ( item ) => item?.priority === 'primary' ) ).toBeTruthy();
	} );

	test( 'It retrieves the importer secondary configs as ImporterOptions', () => {
		const importerOptions = getImportersAsImporterOption( 'secondary' );

		expect( Array.isArray( importerOptions ) ).toBeTruthy();
		expect( importerOptions.length ).toBeGreaterThan( 0 );
		expect( importerOptions.every( ( item ) => item?.priority === 'secondary' ) ).toBeTruthy();
	} );
} );
