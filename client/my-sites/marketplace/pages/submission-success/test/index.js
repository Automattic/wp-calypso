/**
 * @jest-environment jsdom
 */

import { shallow } from 'enzyme';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import SignupSuccess from '../signup-success';

describe( 'Marketplace SignupSuccess', () => {
	const store = createReduxStore();
	const wrapper = shallow(
		<ReduxProvider store={ store }>
			<SignupSuccess />
		</ReduxProvider>
	);

	test( 'should render the page as expected', () => {
		expect( wrapper ).toMatchSnapshot();
	} );
} );
