import { vi } from 'vitest';
import {
	canExposeWebMcpTools,
	getWebMcpModelContext,
	isAbilityOnCurrentScreen,
	isWebMcpExperimentEnabled,
} from '../eligibility';
import type { Ability } from '@wordpress/abilities';

describe( 'WebMCP eligibility', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/' );
		delete ( globalThis as { agentsManagerData?: unknown } ).agentsManagerData;
		Object.defineProperty( document, 'modelContext', { configurable: true, value: undefined } );
		Object.defineProperty( navigator, 'modelContext', { configurable: true, value: undefined } );
	} );

	it( 'is default-off and uses the server-provided development mode', () => {
		expect( isWebMcpExperimentEnabled() ).toBe( false );

		window.history.replaceState( {}, '', '/?webmcp=1' );
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: false,
		};
		expect( isWebMcpExperimentEnabled() ).toBe( false );

		window.history.replaceState( {}, '', '/' );
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: true,
		};
		expect( isWebMcpExperimentEnabled() ).toBe( true );
	} );

	it( 'prefers document.modelContext and falls back to navigator.modelContext', () => {
		const documentContext = { registerTool: vi.fn() };
		const navigatorContext = { registerTool: vi.fn() };

		expect(
			getWebMcpModelContext( { modelContext: documentContext }, { modelContext: navigatorContext } )
		).toBe( documentContext );
		expect(
			getWebMcpModelContext( { modelContext: undefined }, { modelContext: navigatorContext } )
		).toBe( navigatorContext );
		expect( getWebMcpModelContext( {}, {} ) ).toBeUndefined();
	} );

	it( 'is a no-op in unsupported browsers', () => {
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: true,
		};
		expect( canExposeWebMcpTools() ).toBe( false );
	} );

	it( 'qualifies on any screen when enabled in a supported browser', () => {
		( globalThis as { agentsManagerData?: unknown } ).agentsManagerData = {
			isDevMode: true,
		};
		document.body.className = 'wp-admin';
		Object.defineProperty( document, 'modelContext', {
			configurable: true,
			value: { registerTool: vi.fn() },
		} );
		expect( canExposeWebMcpTools() ).toBe( true );
	} );
} );

describe( 'WebMCP ability screens', () => {
	const createAbility = ( webmcp: Record< string, unknown > ) =>
		( { name: 'example/tool', meta: { webmcp } } ) as unknown as Ability;

	beforeEach( () => {
		document.body.className = 'wp-admin';
		window.pagenow = 'woocommerce_page_wc-orders';
	} );

	afterEach( () => {
		delete window.pagenow;
	} );

	it( 'keeps an ability without screens to the editors', () => {
		const ability = createAbility( { public: true } );

		expect( isAbilityOnCurrentScreen( ability ) ).toBe( false );

		document.body.className = 'site-editor-php';
		expect( isAbilityOnCurrentScreen( ability ) ).toBe( true );
	} );

	it( 'shows an ability only on the screens it lists', () => {
		expect(
			isAbilityOnCurrentScreen(
				createAbility( { public: true, screens: [ 'woocommerce_page_wc-orders' ] } )
			)
		).toBe( true );
		expect(
			isAbilityOnCurrentScreen( createAbility( { public: true, screens: [ 'edit-product' ] } ) )
		).toBe( false );
	} );

	it( 'hides a listed ability outside wp-admin', () => {
		delete window.pagenow;

		expect(
			isAbilityOnCurrentScreen(
				createAbility( { public: true, screens: [ 'woocommerce_page_wc-orders' ] } )
			)
		).toBe( false );
	} );
} );
