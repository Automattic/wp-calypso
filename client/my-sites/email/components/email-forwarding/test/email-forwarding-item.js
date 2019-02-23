/** @format */
/**
 * External dependencies
 */
import { Provider } from 'react-redux';
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import EmailForwardingItem from '../email-forwarding-item';

describe( 'EmailForwardingItem', () => {
	test( 'it renders EmailForwardingItem correctly', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<EmailForwardingItem
						emailData={ {
							domain: 'foo.com',
							forward_address: 'foo@a8c.com',
							mailbox: 'foo',
						} }
					/>
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
