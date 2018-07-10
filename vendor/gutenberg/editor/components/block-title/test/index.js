/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { BlockTitle } from '../';

jest.mock( '@wordpress/blocks', () => {
	return {
		getBlockType( name ) {
			switch ( name ) {
				case 'name-not-exists':
					return null;

				case 'name-exists':
					return { title: 'Block Title' };
			}
		},
	};
} );

describe( 'BlockTitle', () => {
	it( 'renders nothing if name is falsey', () => {
		const wrapper = shallow( <BlockTitle /> );

		expect( wrapper.type() ).toBe( null );
	} );

	it( 'renders nothing if block type does not exist', () => {
		const wrapper = shallow( <BlockTitle name="name-not-exists" /> );

		expect( wrapper.type() ).toBe( null );
	} );

	it( 'renders title if block type exists', () => {
		const wrapper = shallow( <BlockTitle name="name-exists" /> );

		expect( wrapper.text() ).toBe( 'Block Title' );
	} );
} );
