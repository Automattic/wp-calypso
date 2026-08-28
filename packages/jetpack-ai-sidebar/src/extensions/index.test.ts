const mockAddFilter = jest.fn();
const mockWithJetpackAiToolbarButton = jest.fn();
const mockRegisterDraftEntry = jest.fn();
const mockWithDraftAssistPlaceholder = jest.fn();

jest.mock( '@wordpress/hooks', () => ( {
	addFilter: mockAddFilter,
} ) );

jest.mock( './block-toolbar-extension', () => ( {
	withJetpackAiToolbarButton: mockWithJetpackAiToolbarButton,
} ) );

jest.mock( './draft-entry', () => ( {
	registerDraftEntry: mockRegisterDraftEntry,
} ) );

jest.mock( './draft-placeholder', () => ( {
	withDraftAssistPlaceholder: mockWithDraftAssistPlaceholder,
} ) );

function installPreview( features: Record< string, boolean > = {}, enabled = true ) {
	( globalThis as Record< string, unknown > ).agentsManagerData = {
		jetpackAiSidebar: {
			enabled,
			features,
		},
	};
}

/**
 * The draft placeholder filter registers unconditionally: the HOC checks the
 * feature flag on every render, so registration cannot lose a race against the
 * host injecting `agentsManagerData`.
 * @returns The addFilter calls that registered the placeholder HOC.
 */
function placeholderFilterCalls() {
	return mockAddFilter.mock.calls.filter(
		( call ) => call[ 1 ] === 'jetpack-ai-sidebar/draft-placeholder'
	);
}

/**
 * @returns The addFilter calls that registered the block toolbar button.
 */
function toolbarFilterCalls() {
	return mockAddFilter.mock.calls.filter(
		( call ) => call[ 1 ] === 'jetpack-ai-sidebar/block-toolbar'
	);
}

function enableToolbarButton() {
	installPreview( { blockToolbarButton: true } );
}

describe( 'Jetpack AI sidebar extension registration', () => {
	beforeEach( () => {
		mockAddFilter.mockClear();
		mockWithJetpackAiToolbarButton.mockClear();
		mockRegisterDraftEntry.mockClear();
		delete ( globalThis as Record< string, unknown > ).agentsManagerData;
		jest.resetModules();
	} );

	it( 'registers the block toolbar filter when the toolbar button is enabled', async () => {
		enableToolbarButton();
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();

		expect( mockAddFilter ).toHaveBeenCalledWith(
			'editor.BlockEdit',
			'jetpack-ai-sidebar/block-toolbar',
			mockWithJetpackAiToolbarButton
		);
	} );

	it( 'registers filters only once', async () => {
		enableToolbarButton();
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();
		registerBlockEditorFilters();
		registerBlockEditorFilters();

		expect( toolbarFilterCalls() ).toHaveLength( 1 );
		expect( placeholderFilterCalls() ).toHaveLength( 1 );
	} );

	it( 'registers the filter regardless of block transformations', async () => {
		installPreview( { blockToolbarButton: true, blockTransformations: false } );
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();

		expect( toolbarFilterCalls() ).toHaveLength( 1 );
		expect( placeholderFilterCalls() ).toHaveLength( 1 );
	} );

	it.each( [
		[ 'preview data is unavailable', undefined ],
		[ 'the toolbar button is disabled', { blockTransformations: true, blockToolbarButton: false } ],
		[ 'only block transformations are enabled', { blockTransformations: true } ],
	] )( 'does not register the filter when %s', async ( _label, features ) => {
		if ( features ) {
			installPreview( features );
		}
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();

		expect( toolbarFilterCalls() ).toHaveLength( 0 );
		// Registered regardless: the HOC itself is flag-gated per render.
		expect( placeholderFilterCalls() ).toHaveLength( 1 );
	} );

	it( 'registers the draft entry point even when the toolbar button is disabled', async () => {
		installPreview( { blockToolbarButton: false, draftAssist: true } );
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();

		expect( toolbarFilterCalls() ).toHaveLength( 0 );
		// Registered regardless: the HOC itself is flag-gated per render.
		expect( placeholderFilterCalls() ).toHaveLength( 1 );
		expect( mockRegisterDraftEntry ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'defers the draft entry point flag check to the draft entry module', async () => {
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();

		expect( mockRegisterDraftEntry ).toHaveBeenCalledTimes( 1 );
	} );
} );
