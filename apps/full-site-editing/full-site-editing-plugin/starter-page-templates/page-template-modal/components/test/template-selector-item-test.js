/**
 * External dependencies
 */
import { uniqueId, omit } from 'lodash';
import { shallow } from 'enzyme';
import TemplateSelectorItem from '../template-selector-item';
import { blocksByTemplatesFixture } from './helpers/templates-blocks-helpers';

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
	} );

	describe( 'Event handlers', () => {
		it( 'calls onFocus prop on MouseEnter over template element', () => {
			const onFocusSpy = jest.fn();

			const templateElSelector = 'button';

			const wrapper = shallow(
				<TemplateSelectorItem { ...requiredProps } onFocus={ onFocusSpy } />
			);

			wrapper.find( templateElSelector ).simulate( 'mouseenter' );

			expect( onFocusSpy ).toHaveBeenCalled();
		} );

		it( 'calls onSelect prop on button click ', () => {
			const onSelectSpy = jest.fn();

			const templateElSelector = 'button';

			const wrapper = shallow(
				<TemplateSelectorItem { ...requiredProps } onSelect={ onSelectSpy } />
			);

			wrapper.find( templateElSelector ).simulate( 'click' );

			expect( onSelectSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'Static previews', () => {
		it( 'renders in static preview mode by default ', () => {
			const wrapper = shallow( <TemplateSelectorItem { ...requiredProps } /> );

			expect( wrapper.find( 'img.template-selector-item__media' ).exists() ).toBe( true );

			expect( wrapper.isEmptyRender() ).toBe( false );
			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'does not render without a staticPreviewImg prop when in non-dynamic mode', () => {
			const wrapper = shallow(
				<TemplateSelectorItem
					{ ...omit( requiredProps, 'staticPreviewImg' ) }
					useDynamicPreview={ false }
				/>
			);

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );

		it( 'renders with img alt text when provided ', () => {
			const expectedAlt = 'This is an alt attribute';

			const wrapper = shallow(
				<TemplateSelectorItem { ...requiredProps } staticPreviewImgAlt={ expectedAlt } />
			);

			expect( wrapper.find( 'img.template-selector-item__media' ).prop( 'alt' ) ).toEqual(
				expectedAlt
			);
		} );
	} );

	describe( 'Dynamic previews', () => {
		it( 'renders in dynamic preview mode', () => {
			const wrapper = shallow(
				<TemplateSelectorItem
					{ ...requiredProps }
					useDynamicPreview={ true }
					blocks={ blocksByTemplatesFixture }
				/>
			);

			const dynamicPreviewComponentName = 'BlockTemplatePreview';

			// console.log(wrapper.debug());
			expect( wrapper.isEmptyRender() ).toBe( false );

			expect( wrapper.find( dynamicPreviewComponentName ).exists() ).toBe( true );

			expect( wrapper.find( 'img.template-selector-item__media' ).exists() ).toBe( false );

			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'does not render without blocks prop when in dynamic mode', () => {
			const wrapper = shallow(
				<TemplateSelectorItem
					{ ...omit( requiredProps, 'staticPreviewImg' ) }
					useDynamicPreview={ true }
					blocks={ null }
				/>
			);

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );
	} );
} );
