const mockAddFilter = jest.fn();
const mockWithJetpackAiToolbarButton = jest.fn();

jest.mock( '@wordpress/hooks', () => ( {
	addFilter: mockAddFilter,
} ) );

jest.mock( './block-toolbar-extension', () => ( {
	withJetpackAiToolbarButton: mockWithJetpackAiToolbarButton,
} ) );

function installPreview( features: Record< string, boolean > = {}, enabled = true ) {
	( globalThis as Record< string, unknown > ).agentsManagerData = {
		jetpackAiSidebar: {
			enabled,
			features,
		},
	};
}

function enableToolbarButton() {
	installPreview( { blockToolbarButton: true } );
}

describe( 'Jetpack AI sidebar extension registration', () => {
	beforeEach( () => {
		mockAddFilter.mockClear();
		mockWithJetpackAiToolbarButton.mockClear();
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

		expect( mockAddFilter ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'registers the filter regardless of block transformations', async () => {
		installPreview( { blockToolbarButton: true, blockTransformations: false } );
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();

		expect( mockAddFilter ).toHaveBeenCalledTimes( 1 );
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

		expect( mockAddFilter ).not.toHaveBeenCalled();
	} );
} );
