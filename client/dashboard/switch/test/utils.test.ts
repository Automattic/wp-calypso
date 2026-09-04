import {
	buildSwitchAgentPrompt,
	getSwitchRepository,
	getMshotsUrl,
	isSwitchRunTerminal,
	isSwitchSessionReadyForReview,
	normalizeSwitchUrl,
} from '../utils';

describe( 'Switch utilities', () => {
	it( 'normalizes public HTTPS source URLs and rejects non-HTTPS URLs', () => {
		expect( normalizeSwitchUrl( ' https://example.com/path#section ' ) ).toBe(
			'https://example.com/path'
		);
		expect( () => normalizeSwitchUrl( 'file:///tmp/source.html' ) ).toThrow();
		expect( () => normalizeSwitchUrl( 'http://example.com' ) ).toThrow();
	} );

	it( 'builds an encoded mShots URL', () => {
		expect( getMshotsUrl( 'https://example.com/path?a=1' ) ).toContain(
			'https%3A%2F%2Fexample.com%2Fpath%3Fa%3D1'
		);
	} );

	it( 'keeps analysis polling until a stable result and advances completed session states to review', () => {
		expect( isSwitchRunTerminal( 'analyzing' ) ).toBe( false );
		expect( isSwitchRunTerminal( 'analysis_ready' ) ).toBe( true );
		expect( isSwitchRunTerminal( 'attached' ) ).toBe( true );
		expect( isSwitchRunTerminal( 'expired' ) ).toBe( true );
		expect( isSwitchSessionReadyForReview( 'preview_ready' ) ).toBe( true );
		expect( isSwitchSessionReadyForReview( 'preview_ready', true ) ).toBe( false );
		expect( isSwitchSessionReadyForReview( 'finished', true ) ).toBe( true );
	} );

	it( 'routes block rendering findings to Blocks Engine', () => {
		expect( getSwitchRepository( 'blocks' ).repository ).toBe( 'Automattic/blocks-engine' );
	} );

	it( 'binds evidence and contribution requirements into the agent prompt', () => {
		const prompt = buildSwitchAgentPrompt( {
			strategy: 'ssi',
			category: 'content',
			observation: 'The About page was not imported.',
			sourceUrl: 'https://source.example',
			targetUrl: 'https://target.example',
			sessionId: 'session-123',
			runId: 'run-123',
			state: 'finished',
			recommendation: 'SSI (high)',
			analysisMetrics: { files: 4, bytes: 1024 },
			previewSummary: { pages: 4 },
			receipt: { success: true, pages: 3 },
		} );

		expect( prompt ).toContain( 'Automattic/static-site-importer' );
		expect( prompt ).toContain( 'Strategy: Faithful reconstruction (SSI)' );
		expect( prompt ).toContain( 'Session: session-123' );
		expect( prompt ).toContain( 'Switch run: run-123' );
		expect( prompt ).toContain( 'Server recommendation: SSI (high)' );
		expect( prompt ).toContain( 'Analysis metrics: files: 4, bytes: 1024' );
		expect( prompt ).toContain( 'Preview metrics: pages: 4' );
		expect( prompt ).toContain( 'Import receipt: success: true, pages: 3' );
		expect( prompt ).toContain( 'The About page was not imported.' );
		expect( prompt ).toContain( 'AI-assistance disclosure' );
	} );

	it( 'describes Blueprint as theme mapping rather than AI site generation', () => {
		const prompt = buildSwitchAgentPrompt( {
			strategy: 'blueprint',
			category: 'content',
			observation: 'The source navigation did not map to the theme header.',
			sourceUrl: 'https://source.example',
			targetUrl: 'https://target.example',
		} );

		expect( prompt ).toContain( 'Adapt to an existing WordPress theme (Blueprint)' );
		expect( prompt ).toContain( 'map into the destination theme templates, patterns, and styles' );
	} );
} );
