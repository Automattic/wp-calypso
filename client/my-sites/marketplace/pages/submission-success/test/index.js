/**
 * @jest-environment jsdom
 */

import { shallow } from 'enzyme';
import SignupSuccess from '../signup-success';

describe( 'Marketplace SignupSuccess', () => {
	const wrapper = shallow( <SignupSuccess /> );

	test( 'should render the page as expected', () => {
		expect( wrapper ).toMatchSnapshot();
	} );
} );
