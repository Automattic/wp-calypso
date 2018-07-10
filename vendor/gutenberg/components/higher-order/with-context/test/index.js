/**
 * External dependencies
 */
import renderer from 'react-test-renderer';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import withContext from '../';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

class PassContext extends Component {
	getChildContext() {
		return this.props.value;
	}

	render() {
		return this.props.children;
	}
}

PassContext.childContextTypes = {
	value: PropTypes.any,
	settings: PropTypes.any,
};

describe( 'withContext', () => {
	it( 'should return a new component which has context', () => {
		const TestComponent = withContext( 'value' )()( ( { value } ) => <div>{ value }</div> );
		const wrapper = renderer.create(
			<PassContext value={ { value: 'ok' } }>
				<TestComponent />
			</PassContext>
		);

		expect( wrapper.root.findByType( 'div' ).children[ 0 ] ).toBe( 'ok' );
	} );

	it( 'should allow specifying a context getter mapping', () => {
		const TestComponent = withContext( 'settings' )(
			( settings ) => ( { remap: settings.value } )
		)(
			( { ignore, remap } ) => <div>{ ignore }{ remap }</div>
		);

		const wrapper = renderer.create(
			<PassContext value={ { settings: { ignore: 'ignore', value: 'ok' } } } >
				<TestComponent />
			</PassContext>
		);

		expect( wrapper.root.findByType( 'div' ).children[ 0 ] ).toBe( 'ok' );
	} );
} );
