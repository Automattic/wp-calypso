/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormFileUpload from '../';

describe( 'InserterMenu', () => {
	it( 'should show an Icon Button and a hidden input', () => {
		const wrapper = shallow(
			<FormFileUpload
				instanceId={ 1 }
				blocks={ [] }
				recentlyUsedBlocks={ [] }
				debouncedSpeak={ noop }
			>
				My Upload Button
			</FormFileUpload>
		);

		const iconButton = wrapper.find( 'IconButton' );
		const input = wrapper.find( 'input' );
		expect( iconButton.prop( 'children' ) ).toBe( 'My Upload Button' );
		expect( input.prop( 'style' ).display ).toBe( 'none' );
	} );
} );
