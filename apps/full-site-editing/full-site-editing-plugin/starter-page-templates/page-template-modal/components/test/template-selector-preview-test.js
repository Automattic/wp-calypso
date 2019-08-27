/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { blocksFixture } from './helpers/templates-blocks-helpers';
import TemplateSelectorPreview from '../template-selector-preview';

describe( 'TemplateSelectorPreview', () => {
	describe( 'Basic rendering', () => {
		it( 'renders preview when blocks are provided', () => {
			const wrapper = shallow(
				<TemplateSelectorPreview blocks={ blocksFixture } viewportWidth={ 960 } />
			);

			expect( wrapper.isEmptyRender() ).toBe( false );

			expect( wrapper.find( 'BlockTemplatePreview' ).exists() ).toBe( true );
			expect( wrapper.find( 'Disabled' ).exists() ).toBe( true );
			expect( wrapper.find( '.template-selector-preview__placeholder' ).exists() ).toBe( false );
			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'renders placeholder when no blocks are provided', () => {
			const wrapper = shallow( <TemplateSelectorPreview viewportWidth={ 960 } /> );

			expect( wrapper.isEmptyRender() ).toBe( false );
			expect( wrapper.find( '.template-selector-preview__placeholder' ).exists() ).toBe( true );
			expect( wrapper.find( 'BlockTemplatePreview' ).exists() ).toBe( false );
			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'renders placeholder when blocks is not an array', () => {
			const invalidBlocksProp = {
				'some-block-1': {
					block: 'foo',
				},
				'some-block-2': {
					block: 'bar',
				},
			};

			const wrapper = shallow(
				<TemplateSelectorPreview blocks={ invalidBlocksProp } viewportWidth={ 960 } />
			);

			expect( wrapper.isEmptyRender() ).toBe( false );
			expect( wrapper.find( '.template-selector-preview__placeholder' ).exists() ).toBe( true );
			expect( wrapper.find( 'BlockTemplatePreview' ).exists() ).toBe( false );
		} );
	} );
} );
