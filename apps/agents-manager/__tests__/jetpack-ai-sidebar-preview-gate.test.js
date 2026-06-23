/**
 * @jest-environment jsdom
 */

import { shouldSuppressJetpackAiSidebarPreview } from '../jetpack-ai-sidebar-preview-gate';

const JETPACK_PROVIDER = 'https://widgets.wp.com/agents-manager/jetpack-ai-sidebar.provider.mjs';
const BIG_SKY_PROVIDER =
	'https://example.com/wp-content/plugins/big-sky/build/calypso-agent-provider/index.js';
const BLOCK_NOTES_PROVIDER = 'block-notes/headless-agent-provider';

const setAgentsManagerData = ( data ) => {
	globalThis.agentsManagerData = data;
};

describe( 'shouldSuppressJetpackAiSidebarPreview', () => {
	afterEach( () => {
		delete globalThis.agentsManagerData;
		delete window._currentSiteType;
	} );

	it( 'does not suppress when agentsManagerData is undefined', () => {
		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( false );
	} );

	it( 'does not suppress when new Jetpack advertises the jetpackAiSidebar contract', () => {
		window._currentSiteType = 'atomic';
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
			jetpackAiSidebar: { enabled: true },
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( false );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [ JETPACK_PROVIDER ] );
	} );

	it( 'does not suppress on Simple sites (server-gated)', () => {
		window._currentSiteType = 'simple';
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( false );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [ JETPACK_PROVIDER ] );
	} );

	it( 'does not suppress non-Jetpack providers like Block Notes', () => {
		window._currentSiteType = 'atomic';
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ BLOCK_NOTES_PROVIDER ],
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( false );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [ BLOCK_NOTES_PROVIDER ] );
	} );

	it( 'suppresses on non-Simple sites when the legacy sidebar is the only provider', () => {
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [] );
	} );

	it( 'suppresses on Atomic when no providers remain', () => {
		window._currentSiteType = 'atomic';
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [],
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
	} );

	it( 'filters only the Jetpack AI Sidebar provider when others remain', () => {
		window._currentSiteType = 'atomic';
		const objectProvider = { toolProvider: {} };
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ objectProvider, BIG_SKY_PROVIDER, JETPACK_PROVIDER ],
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( false );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [
			objectProvider,
			BIG_SKY_PROVIDER,
		] );
	} );

	it( 'stays suppressed when called again after filtering', () => {
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
	} );

	it( 'tolerates a malformed agentProviders value', () => {
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: 'not-an-array',
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [] );
	} );
} );
