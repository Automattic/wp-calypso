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

	it( 'does not suppress or filter when the preview data is absent', () => {
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ BLOCK_NOTES_PROVIDER ],
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( false );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [ BLOCK_NOTES_PROVIDER ] );
	} );

	it( 'does not suppress or filter on Simple sites', () => {
		window._currentSiteType = 'simple';
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( false );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [ JETPACK_PROVIDER ] );
	} );

	it( 'suppresses on self-hosted sites where the preview registered the only provider', () => {
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [] );
	} );

	it( 'suppresses on Atomic sites when no providers remain', () => {
		window._currentSiteType = 'atomic';
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [],
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
	} );

	it( 'filters only the Jetpack AI Sidebar provider when others remain', () => {
		window._currentSiteType = 'atomic';
		const objectProvider = { toolProvider: {} };
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: [ objectProvider, BIG_SKY_PROVIDER, JETPACK_PROVIDER ],
			jetpackAiSidebarPreview: { enabled: true },
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
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
	} );

	it( 'tolerates a malformed agentProviders value', () => {
		setAgentsManagerData( {
			sectionName: 'gutenberg',
			agentProviders: 'not-an-array',
			jetpackAiSidebarPreview: { enabled: true },
		} );

		expect( shouldSuppressJetpackAiSidebarPreview() ).toBe( true );
		expect( globalThis.agentsManagerData.agentProviders ).toEqual( [] );
	} );
} );
