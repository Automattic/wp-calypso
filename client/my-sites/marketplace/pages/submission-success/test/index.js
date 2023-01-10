/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import SignupSuccess from '../signup-success';

describe( 'Marketplace SignupSuccess', () => {
	const store = createReduxStore();
	const { container } = render(
		<ReduxProvider store={ store }>
			<SignupSuccess />
		</ReduxProvider>
	);

	test( 'should render the page as expected', () => {
		expect( container ).toMatchSnapshot();
	} );
} );
