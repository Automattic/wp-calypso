/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { SharedBlockConvertButton } from '../shared-block-convert-button';

describe( 'SharedBlockConvertButton', () => {
	it( 'should not render when isVisble false', () => {
		const wrapper = shallow(
			<SharedBlockConvertButton isVisible={ false } />
		);
		expect( wrapper.children() ).not.toExist();
	} );

	it( 'should allow converting a static block to a shared block', () => {
		const onConvert = jest.fn();
		const wrapper = shallow(
			<SharedBlockConvertButton
				isVisible
				isStaticBlock
				onConvertToShared={ onConvert }
			/>
		);
		const button = wrapper.find( 'IconButton' ).first();
		expect( button.children().text() ).toBe( 'Convert to Shared Block' );
		button.simulate( 'click' );
		expect( onConvert ).toHaveBeenCalled();
	} );

	it( 'should allow converting a shared block to static', () => {
		const onConvert = jest.fn();
		const wrapper = shallow(
			<SharedBlockConvertButton
				isVisible
				isStaticBlock={ false }
				onConvertToStatic={ onConvert }
			/>
		);
		const button = wrapper.find( 'IconButton' ).first();
		expect( button.children().text() ).toBe( 'Convert to Regular Block' );
		button.simulate( 'click' );
		expect( onConvert ).toHaveBeenCalled();
	} );
} );
