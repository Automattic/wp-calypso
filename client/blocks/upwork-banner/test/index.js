/**
 * External dependencies
 */
import { Provider } from 'react-redux';
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import UpworkBanner from '../';

describe( 'UpworkBanner', () => {
	test( 'renders correctly', () => {
		const store = createReduxStore();
		setStore( store );
		const tree = renderer
			.create(
				<Provider store={ store }>
					<UpworkBanner location={ 'foo' } />
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
