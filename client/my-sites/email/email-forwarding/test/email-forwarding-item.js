import renderer from 'react-test-renderer';
import { createReduxStore } from 'calypso/state';
import EmailForwardingItem from '../email-forwarding-item';

describe( 'EmailForwardingItem', () => {
	test( 'it renders EmailForwardingItem correctly', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<EmailForwardingItem
					emailData={ {
						domain: 'foo.com',
						forward_address: 'foo@a8c.com',
						mailbox: 'foo',
					} }
					store={ store }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
