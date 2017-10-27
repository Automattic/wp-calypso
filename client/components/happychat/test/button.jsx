/** @format */

/**
 * Internal dependencies
 */
import { HappychatButton } from '../button';

describe( 'Connection', () => {
	let component;
	beforeEach( () => {
		component = new HappychatButton();
		component.props = {
			initConnection: jest.fn(),
			getConfig: jest.fn(),
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
