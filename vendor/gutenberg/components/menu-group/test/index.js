/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { MenuGroup } from '../';

describe( 'MenuGroup', () => {
	test( 'should render null when no children provided', () => {
		const wrapper = shallow( <MenuGroup /> );

		expect( wrapper.html() ).toBe( null );
	} );

	test( 'should match snapshot', () => {
		const wrapper = shallow(
			<MenuGroup
				label="My group"
				instanceId="1"
			>
				<p>My item</p>
			</MenuGroup>
		);

		expect( wrapper ).toMatchSnapshot();
	} );
} );
