/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import MoreMenu from '../index';

describe( 'MoreMenu', () => {
	it( 'should match snapshot', () => {
		const wrapper = mount(
			<MoreMenu />
		);

		expect( wrapper ).toMatchSnapshot();
	} );
} );
