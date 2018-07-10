/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Notice from '../index';

describe( 'Notice', () => {
	it( 'should match snapshot', () => {
		const wrapper = shallow( <Notice status="example" /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	it( 'should not have is-dismissible class when isDismissible prop is false', () => {
		const wrapper = shallow( <Notice isDismissible={ false } /> );
		expect( wrapper.hasClass( 'is-dismissible' ) ).toBe( false );
	} );
} );
