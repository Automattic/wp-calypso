/**
 * @jest-environment jsdom
 */

const mockShouldLoadSurvicate = jest.fn();
const mockLoadSurvicateScript = jest.fn();
const mockSetSurvicateVisitorTraits = jest.fn();
const mockIsMobile = jest.fn();
const mockRegisterSurveySuppressor = jest.fn();

jest.mock( '@automattic/survicate', () => ( {
	SURVICATE_WORKSPACE_ID: 'workspace-id',
	shouldLoadSurvicate: mockShouldLoadSurvicate,
	loadSurvicateScript: mockLoadSurvicateScript,
	setSurvicateVisitorTraits: mockSetSurvicateVisitorTraits,
	registerSurveySuppressor: mockRegisterSurveySuppressor,
} ) );

jest.mock( '@automattic/viewport', () => ( {
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
function boot( config ) {
	if ( config === undefined ) {
		delete window.wpcomSurvicateConfig;
	} else {
		window.wpcomSurvicateConfig = config;
	}
	jest.isolateModules( () => {
		require( '../survicate' );
	} );
}

const flushPromises = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'wp-admin Survicate entry', () => {
	beforeEach( () => {
		mockShouldLoadSurvicate.mockReset().mockReturnValue( true );
		mockLoadSurvicateScript.mockReset().mockResolvedValue( undefined );
		mockSetSurvicateVisitorTraits.mockReset();
		mockIsMobile.mockReset().mockReturnValue( false );
		mockRegisterSurveySuppressor.mockReset();
	} );

	afterEach( () => {
		delete window.wpcomSurvicateConfig;
		document.body.innerHTML = '';
	} );

	it( 'does nothing when PHP emitted no config', () => {
		boot( undefined );

		expect( mockShouldLoadSurvicate ).not.toHaveBeenCalled();
		expect( mockLoadSurvicateScript ).not.toHaveBeenCalled();
	} );

	it( 'gates on the locale PHP sent and a desktop viewport', () => {
		boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: false } );
	} );

	it( 'uses the shared Calypso mobile breakpoint', () => {
		mockIsMobile.mockReturnValue( true );

		boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: true } );
	} );

	it( 'treats an undetermined viewport as desktop', () => {
		mockIsMobile.mockReturnValue( undefined );

		boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: false } );
	} );

	it( 'does not load the SDK when the load gate says no', () => {
		mockShouldLoadSurvicate.mockReturnValue( false );

		boot( CONFIG );

		expect( mockLoadSurvicateScript ).not.toHaveBeenCalled();
	} );

	it( 'loads the SDK for the shared workspace and pushes the PHP traits', async () => {
		boot( CONFIG );
		await flushPromises();

		expect( mockLoadSurvicateScript ).toHaveBeenCalledWith( 'workspace-id' );
		expect( mockSetSurvicateVisitorTraits ).toHaveBeenCalledWith( CONFIG.traits );
	} );

	it( 'swallows an SDK load failure', async () => {
		const onUnhandledRejection = jest.fn();
		process.on( 'unhandledRejection', onUnhandledRejection );
		mockLoadSurvicateScript.mockRejectedValue( new Error( 'blocked' ) );

		try {
			expect( () => boot( CONFIG ) ).not.toThrow();
			await flushPromises();

			expect( onUnhandledRejection ).not.toHaveBeenCalled();
			expect( mockSetSurvicateVisitorTraits ).not.toHaveBeenCalled();
		} finally {
			process.off( 'unhandledRejection', onUnhandledRejection );
		}
	} );

	describe( 'notifications panel', () => {
		function renderNotesMenuItem() {
			const item = document.createElement( 'li' );
			item.id = 'wp-admin-bar-notes';
			item.className = 'menupop';
			document.body.appendChild( item );
			return item;
		}

		function getSuppressor() {
			return mockRegisterSurveySuppressor.mock.calls[ 0 ]?.[ 0 ];
		}

		it( 'registers a notifications suppressor when the admin bar has the notes menu', () => {
			renderNotesMenuItem();

			boot( CONFIG );

			expect( mockRegisterSurveySuppressor ).toHaveBeenCalledTimes( 1 );
			expect( getSuppressor().reason ).toBe( 'notifications' );
		} );

		it( 'is active only while the panel is shown', () => {
			const item = renderNotesMenuItem();
			boot( CONFIG );
			const suppressor = getSuppressor();

			expect( suppressor.isActive() ).toBe( false );

			item.classList.add( 'wpnt-show' );
			expect( suppressor.isActive() ).toBe( true );

			item.classList.remove( 'wpnt-show' );
			expect( suppressor.isActive() ).toBe( false );
		} );

		it( 'notifies subscribers when the menu item class changes, until unsubscribed', async () => {
			const item = renderNotesMenuItem();
			boot( CONFIG );
			const onChange = jest.fn();
			const unsubscribe = getSuppressor().subscribe( onChange );

			item.classList.add( 'wpnt-show' );
			await flushPromises();
			expect( onChange ).toHaveBeenCalledTimes( 1 );

			unsubscribe();
			item.classList.remove( 'wpnt-show' );
			await flushPromises();
			expect( onChange ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not register a suppressor when the notes menu is absent', () => {
			boot( CONFIG );

			expect( mockRegisterSurveySuppressor ).not.toHaveBeenCalled();
		} );

		it( 'does not register a suppressor when Survicate will not load', () => {
			renderNotesMenuItem();
			mockShouldLoadSurvicate.mockReturnValue( false );

			boot( CONFIG );

			expect( mockRegisterSurveySuppressor ).not.toHaveBeenCalled();
		} );
	} );
} );
