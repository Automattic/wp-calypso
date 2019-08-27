/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { blocksByTemplatesFixture } from './helpers/templates-blocks-helpers';
import TemplateSelectorPreview from '../template-selector-preview';

describe( 'TemplateSelectorPreview', () => {
	describe( 'Basic rendering', () => {
		it( 'renders preview when blocks are provided', () => {
			const wrapper = shallow(
				<TemplateSelectorPreview blocks={ blocksByTemplatesFixture } viewportWidth={ 960 } />
			);

			expect( wrapper.isEmptyRender() ).toBe( false );
			expect( wrapper.find( 'Disabled' ).exists() ).toBe( true );
			expect( wrapper.find( 'BlockTemplatePreview' ).exists() ).toBe( true );
			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'renders placeholder when no blocks are provided', () => {
			const wrapper = shallow( <TemplateSelectorPreview viewportWidth={ 960 } /> );

			expect( wrapper.isEmptyRender() ).toBe( false );
			expect( wrapper.find( '.template-selector-preview__placeholder' ).exists() ).toBe( true );
			expect( wrapper.find( 'BlockTemplatePreview' ).exists() ).toBe( false );
			expect( wrapper ).toMatchSnapshot();
		} );
	} );
} );
