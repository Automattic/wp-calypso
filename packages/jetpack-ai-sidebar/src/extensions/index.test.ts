const mockAddFilter = jest.fn();
const mockWithJetpackAiToolbarButton = jest.fn();

jest.mock( '@wordpress/hooks', () => ( {
	addFilter: mockAddFilter,
} ) );

jest.mock( './block-toolbar-extension', () => ( {
	withJetpackAiToolbarButton: mockWithJetpackAiToolbarButton,
} ) );

describe( 'Jetpack AI sidebar extension registration', () => {
	beforeEach( () => {
		mockAddFilter.mockClear();
		mockWithJetpackAiToolbarButton.mockClear();
		jest.resetModules();
	} );

	it( 'registers the block toolbar filter', async () => {
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();

		expect( mockAddFilter ).toHaveBeenCalledWith(
			'editor.BlockEdit',
			'jetpack-ai-sidebar/block-toolbar',
			mockWithJetpackAiToolbarButton
		);
	} );

	it( 'registers filters only once', async () => {
		const { registerBlockEditorFilters } = await import( './index' );

		registerBlockEditorFilters();
		registerBlockEditorFilters();
		registerBlockEditorFilters();

		expect( mockAddFilter ).toHaveBeenCalledTimes( 1 );
	} );
} );
