/**
 * Internal dependencies
 */
import { HappychatButton } from '../button';

describe( 'Button', () => {
	let component;
	beforeEach( () => {
		component = new HappychatButton();
		component.props = {
			initConnection: jest.fn(),
			getAuth: jest.fn(),
		};
	} );

	test( 'initConnection if connection is uninitialized', () => {
		component.props.isConnectionUninitialized = true;
		component.componentDidMount();
		expect( component.props.initConnection ).toHaveBeenCalled();
	} );

	test( 'do not initConnection if connection is not uninitialized', () => {
		component.props.isConnectionUninitialized = false;
		component.componentDidMount();
		expect( component.props.initConnection ).not.toHaveBeenCalled();
	} );
} );
