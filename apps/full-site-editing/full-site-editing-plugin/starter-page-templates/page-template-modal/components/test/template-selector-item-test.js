/**
 * External dependencies
 */
import { uniqueId, omit } from 'lodash';
import { shallow } from 'enzyme';
import TemplateSelectorItem from '../template-selector-item';

describe( 'TemplateSelectorItem', () => {
	const requiredProps = {
		id: uniqueId(),
		label: 'Test Template',
		value: 'test-template',
		staticPreviewImg: 'https://somepreviewimage.jpg',
	};

	describe( 'Basic rendering', () => {
		it( 'renders with required props', () => {
			const wrapper = shallow( <TemplateSelectorItem { ...requiredProps } /> );

			expect( wrapper.isEmptyRender() ).toBe( false );

			// Explicitly assert these elements exist
			expect( wrapper.find( '[data-test-id="template-selector-item-label"]' ).exists() ).toBe(
				true
			);
			expect( wrapper.find( 'img.template-selector-item__media' ).exists() ).toBe( true );

			// Catch all Snapshot
			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'does not render without id prop', () => {
			const wrapper = shallow( <TemplateSelectorItem { ...omit( requiredProps, 'id' ) } /> );

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );

		it( 'does not render without value prop', () => {
			const wrapper = shallow( <TemplateSelectorItem { ...omit( requiredProps, 'value' ) } /> );

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );

		it( 'does not render without a staticPreviewImg prop when in non-dynamic mode', () => {
			const wrapper = shallow(
				<TemplateSelectorItem
					{ ...omit( requiredProps, 'staticPreviewImg' ) }
					useDynamicPreview={ false }
				/>
			);

			// console.log(wrapper.debug());

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );
	} );
} );
