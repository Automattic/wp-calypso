/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import MenuItem from '../';

describe( 'MenuItem', () => {
	test( 'should match snapshot when only label provided', () => {
		const wrapper = shallow(
			<MenuItem>
				My item
			</MenuItem>
		);

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should match snapshot when all props provided', () => {
		const wrapper = shallow(
			<MenuItem
				className="my-class"
				icon="wordpress"
				isSelected={ true }
				onClick={ () => {} }
				shortcut="mod+shift+alt+w"
			>
				My item
			</MenuItem>
		);

		expect( wrapper ).toMatchSnapshot();
	} );
} );
