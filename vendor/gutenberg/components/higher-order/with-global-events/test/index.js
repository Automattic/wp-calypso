/**
 * External dependencies
 */
import TestRenderer from 'react-test-renderer';

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import withGlobalEvents from '../';
import Listener from '../listener';

jest.mock( '../listener', () => {
	const ActualListener = require.requireActual( '../listener' ).default;

	return class extends ActualListener {
		constructor() {
			super( ...arguments );

			this.constructor._instance = this;

			jest.spyOn( this, 'add' );
			jest.spyOn( this, 'remove' );
		}
	};
} );

describe( 'withGlobalEvents', () => {
	let wrapper;

	class OriginalComponent extends Component {
		handleResize( event ) {
			this.props.onResize( event );
		}

		render() {
			return <div>{ this.props.children }</div>;
		}
	}

	beforeAll( () => {
		jest.spyOn( OriginalComponent.prototype, 'handleResize' );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	function mountEnhancedComponent( props = {} ) {
		const EnhancedComponent = withGlobalEvents( {
			resize: 'handleResize',
		} )( OriginalComponent );

		props.ref = () => {};

		wrapper = TestRenderer.create( <EnhancedComponent { ...props }>Hello</EnhancedComponent> );
	}

	it( 'renders with original component', () => {
		mountEnhancedComponent();

		expect( wrapper.root.findByType( 'div' ).children[ 0 ] ).toBe( 'Hello' );
	} );

	it( 'binds events from passed object', () => {
		mountEnhancedComponent();

		// Get the HOC wrapper instance
		const hocInstance = wrapper.root.findByType( OriginalComponent ).parent.instance;

		expect( Listener._instance.add ).toHaveBeenCalledWith( 'resize', hocInstance );
	} );

	it( 'handles events', () => {
		const onResize = jest.fn();

		mountEnhancedComponent( { onResize } );

		const event = { type: 'resize' };

		Listener._instance.handleEvent( event );

		expect( OriginalComponent.prototype.handleResize ).toHaveBeenCalledWith( event );
		expect( onResize ).toHaveBeenCalledWith( event );
	} );
} );
