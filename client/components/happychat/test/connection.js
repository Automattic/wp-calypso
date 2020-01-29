/**
 * Internal dependencies
 */
import { HappychatConnection } from '../connection';

describe( 'Connection', () => {
	let component;
	beforeEach( () => {
		component = new HappychatConnection();
		component.props = {
			initConnection: jest.fn(),
			getAuth: jest.fn(),
		};
	} );

	test( 'initConnection if connection is uninitialized and happychat is enabled', () => {
		component.props.isConnectionUninitialized = true;
		component.props.isHappychatEnabled = true;
		component.componentDidMount();
		expect( component.props.initConnection ).toHaveBeenCalled();
	} );

	test( 'do not initConnection if connection is not uninitialized', () => {
		component.props.isConnectionUninitialized = false;
		component.props.isHappychatEnabled = true;
		component.componentDidMount();
		expect( component.props.initConnection ).not.toHaveBeenCalled();
	} );

	test( 'do not initConnection if happychat is not enabled', () => {
		component.props.isConnectionUninitialized = true;
		component.props.isHappychatEnabled = false;
		component.componentDidMount();
		expect( component.props.initConnection ).not.toHaveBeenCalled();
	} );
} );
