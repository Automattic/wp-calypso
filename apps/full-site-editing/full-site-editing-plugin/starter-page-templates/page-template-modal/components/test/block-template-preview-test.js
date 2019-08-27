/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { blocksFixture } from './helpers/templates-blocks-helpers';
import BlockTemplatePreview from '../block-template-preview';

// Skipped until block-editor exports BlockPreview correctly
describe.skip( 'BlockTemplatePreview', () => {
	describe( 'Basic rendering', () => {
		it( 'renders preview when blocks are provided', () => {
			const wrapper = shallow( <BlockTemplatePreview blocks={ blocksFixture } /> );

			expect( wrapper.isEmptyRender() ).toBe( false );
			expect( wrapper.find( 'BlockPreview' ).exists() ).toBe( true );
			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'renders with important className attributes', () => {
			const wrapper = shallow( <BlockTemplatePreview blocks={ blocksFixture } /> );

			expect( wrapper.hasClass( 'edit-post-visual-editor' ) ).toBe( true );
			expect( wrapper.find( '.editor-styles-wrapper' ).exists() ).toBe( true );
			expect( wrapper.find( '.editor-writing-flow' ).exists() ).toBe( true );
		} );
	} );
} );
