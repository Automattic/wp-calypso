/**
 * @vitest-environment jsdom
 */

import { vi } from 'vitest';
const mockShouldLoadSurvicate = vi.fn();
const mockLoadSurvicateScript = vi.fn();
const mockSetSurvicateVisitorTraits = vi.fn();
const mockIsMobile = vi.fn();

vi.mock( '@automattic/survicate', () => ( {
	SURVICATE_WORKSPACE_ID: 'workspace-id',
	shouldLoadSurvicate: mockShouldLoadSurvicate,
	loadSurvicateScript: mockLoadSurvicateScript,
	setSurvicateVisitorTraits: mockSetSurvicateVisitorTraits,
} ) );

vi.mock( '@automattic/viewport', () => ( {
	isMobile: mockIsMobile,
} ) );

const CONFIG = {
	locale: 'en_US',
	traits: {
		email: 'user@example.com',
		site_id: '123',
		site_type: 'simple',
		editor_context: 'wp-admin',
		is_big_sky_site: 'false',
	},
};

// The entry runs on import, so each test re-imports it in isolation.
async function boot( config ) {
	if ( config === undefined ) {
		delete window.wpcomSurvicateConfig;
	} else {
		window.wpcomSurvicateConfig = config;
	}
	vi.resetModules();
	await import( '../survicate' );
}

const flushPromises = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'wp-admin Survicate entry', () => {
	beforeEach( () => {
		mockShouldLoadSurvicate.mockReset().mockReturnValue( true );
		mockLoadSurvicateScript.mockReset().mockResolvedValue( undefined );
		mockSetSurvicateVisitorTraits.mockReset();
		mockIsMobile.mockReset().mockReturnValue( false );
	} );

	afterEach( () => {
		delete window.wpcomSurvicateConfig;
	} );

	it( 'does nothing when PHP emitted no config', async () => {
		await boot( undefined );

		expect( mockShouldLoadSurvicate ).not.toHaveBeenCalled();
		expect( mockLoadSurvicateScript ).not.toHaveBeenCalled();
	} );

	it( 'gates on the locale PHP sent and a desktop viewport', async () => {
		await boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: false } );
	} );

	it( 'uses the shared Calypso mobile breakpoint', async () => {
		mockIsMobile.mockReturnValue( true );

		await boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: true } );
	} );

	it( 'treats an undetermined viewport as desktop', async () => {
		mockIsMobile.mockReturnValue( undefined );

		await boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: false } );
	} );

	it( 'does not load the SDK when the load gate says no', async () => {
		mockShouldLoadSurvicate.mockReturnValue( false );

		await boot( CONFIG );

		expect( mockLoadSurvicateScript ).not.toHaveBeenCalled();
	} );

	it( 'loads the SDK for the shared workspace and pushes the PHP traits', async () => {
		await boot( CONFIG );
		await flushPromises();

		expect( mockLoadSurvicateScript ).toHaveBeenCalledWith( 'workspace-id' );
		expect( mockSetSurvicateVisitorTraits ).toHaveBeenCalledWith( CONFIG.traits );
	} );

	it( 'swallows an SDK load failure', async () => {
		const onUnhandledRejection = vi.fn();
		process.on( 'unhandledRejection', onUnhandledRejection );
		mockLoadSurvicateScript.mockRejectedValue( new Error( 'blocked' ) );

		try {
			await expect( boot( CONFIG ) ).resolves.toBeUndefined();
			await flushPromises();

			expect( onUnhandledRejection ).not.toHaveBeenCalled();
			expect( mockSetSurvicateVisitorTraits ).not.toHaveBeenCalled();
		} finally {
			process.off( 'unhandledRejection', onUnhandledRejection );
		}
	} );
} );
