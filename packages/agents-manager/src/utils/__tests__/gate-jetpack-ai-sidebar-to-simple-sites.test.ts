import {
	getAgentProvidersWithJetpackAiSidebarGated,
	shouldSuppressAgentsManagerWhenJetpackAiSidebarGated,
} from '../gate-jetpack-ai-sidebar-to-simple-sites';

const JETPACK_PROVIDER = 'https://widgets.wp.com/agents-manager/jetpack-ai-sidebar.provider.mjs';
const BIG_SKY_PROVIDER =
	'https://example.com/wp-content/plugins/big-sky/build/calypso-agent-provider/index.js';

const setAgentsManagerData = ( data: unknown ) => {
	( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData = data;
};

const setJetpackScriptData = ( data: unknown ) => {
	( globalThis as typeof globalThis & { JetpackScriptData?: unknown } ).JetpackScriptData = data;
};

const setCurrentSiteType = ( siteType: unknown ) => {
	( globalThis as typeof globalThis & { _currentSiteType?: unknown } )._currentSiteType = siteType;
};

describe( 'Jetpack AI Sidebar Simple-site gate', () => {
	afterEach( () => {
		delete ( globalThis as typeof globalThis & { agentsManagerData?: unknown } ).agentsManagerData;
		delete ( globalThis as typeof globalThis & { JetpackScriptData?: unknown } ).JetpackScriptData;
		delete ( globalThis as typeof globalThis & { _currentSiteType?: unknown } )._currentSiteType;
	} );

	it( 'keeps the Jetpack AI Sidebar provider on WordPress.com Simple sites from editor site type', () => {
		setCurrentSiteType( 'simple' );
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( getAgentProvidersWithJetpackAiSidebarGated() ).toEqual( [ JETPACK_PROVIDER ] );
		expect( shouldSuppressAgentsManagerWhenJetpackAiSidebarGated() ).toBe( false );
	} );

	it( 'keeps the Jetpack AI Sidebar provider on WordPress.com Simple sites from Jetpack script data', () => {
		setJetpackScriptData( { site: { host: 'wpcom' } } );
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( getAgentProvidersWithJetpackAiSidebarGated() ).toEqual( [ JETPACK_PROVIDER ] );
		expect( shouldSuppressAgentsManagerWhenJetpackAiSidebarGated() ).toBe( false );
	} );

	it( 'removes only the Jetpack AI Sidebar provider on WordPress.com Atomic sites', () => {
		setCurrentSiteType( 'atomic' );
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ BIG_SKY_PROVIDER, JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( getAgentProvidersWithJetpackAiSidebarGated() ).toEqual( [ BIG_SKY_PROVIDER ] );
		expect( shouldSuppressAgentsManagerWhenJetpackAiSidebarGated() ).toBe( false );
	} );

	it( 'removes the Jetpack AI Sidebar provider on self-hosted Jetpack sites', () => {
		setJetpackScriptData( { site: { host: 'unknown' } } );
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( getAgentProvidersWithJetpackAiSidebarGated() ).toEqual( [] );
		expect( shouldSuppressAgentsManagerWhenJetpackAiSidebarGated() ).toBe( true );
	} );

	it( 'suppresses Agents Manager when Jetpack AI Sidebar is the only non-Simple post-editor provider', () => {
		setCurrentSiteType( 'atomic' );
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( shouldSuppressAgentsManagerWhenJetpackAiSidebarGated() ).toBe( true );
	} );

	it( 'does not remove the Jetpack AI Sidebar provider outside the post editor', () => {
		setCurrentSiteType( 'atomic' );
		setAgentsManagerData( {
			sectionName: 'wp-admin',
			agentProviders: [ JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( getAgentProvidersWithJetpackAiSidebarGated() ).toEqual( [ JETPACK_PROVIDER ] );
		expect( shouldSuppressAgentsManagerWhenJetpackAiSidebarGated() ).toBe( false );
	} );

	it( 'does not suppress unrelated post-editor providers', () => {
		setCurrentSiteType( 'atomic' );
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ BIG_SKY_PROVIDER ],
		} );

		expect( getAgentProvidersWithJetpackAiSidebarGated() ).toEqual( [ BIG_SKY_PROVIDER ] );
		expect( shouldSuppressAgentsManagerWhenJetpackAiSidebarGated() ).toBe( false );
	} );
} );
