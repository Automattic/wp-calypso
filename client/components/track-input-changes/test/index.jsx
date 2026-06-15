/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Component, createRef } from 'react';
import TrackInputChanges from '../';

/**
 * Module variables
 */
const spies = {
	onNewValue: null,
	onChange: null,
	onBlur: null,
};

class DummyInput extends Component {
	triggerChange = ( value ) => {
		this.props.onChange( { target: this, value } );
	};

	triggerBlur = () => {
		this.props.onBlur( { target: this } );
	};

	render() {
		return <div />;
	}
}

describe( 'TrackInputChanges#onNewValue', () => {
	let dummyInput;

	beforeEach( () => {
		for ( const spy in spies ) {
			spies[ spy ] = jest.fn();
		}

		const ref = createRef();
		render(
			<TrackInputChanges onNewValue={ spies.onNewValue }>
				<DummyInput ref={ ref } onChange={ spies.onChange } onBlur={ spies.onBlur } />
			</TrackInputChanges>
		);
		dummyInput = ref.current;
	} );

	test( 'should pass through callbacks but not trigger on a change event', () => {
		dummyInput.triggerChange( 'abc' );

		expect( spies.onNewValue ).toHaveBeenCalledTimes( 0 );
		expect( spies.onChange ).toHaveBeenCalledTimes( 1 );
		expect( spies.onBlur ).toHaveBeenCalledTimes( 0 );
	} );

	test( 'should pass through callbacks but not trigger on a blur event', () => {
		dummyInput.triggerBlur();

		expect( spies.onNewValue ).toHaveBeenCalledTimes( 0 );
		expect( spies.onChange ).toHaveBeenCalledTimes( 0 );
		expect( spies.onBlur ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should pass through callbacks and trigger on a change then a blur', () => {
		dummyInput.triggerChange( 'abc' );
		dummyInput.triggerBlur();

		expect( spies.onNewValue ).toHaveBeenCalledTimes( 1 );
		expect( spies.onChange ).toHaveBeenCalledTimes( 1 );
		expect( spies.onBlur ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should trigger once on each blur event only if value changed', () => {
		dummyInput.triggerBlur();
		dummyInput.triggerChange( 'abc' );
		dummyInput.triggerChange( 'abcd' );
		dummyInput.triggerBlur();
		dummyInput.triggerChange( 'abcde' );
		dummyInput.triggerChange( 'abcdef' );
		dummyInput.triggerBlur();
		dummyInput.triggerChange( 'abcdefg' );

		expect( spies.onNewValue ).toHaveBeenCalledTimes( 2 );
		expect( spies.onChange ).toHaveBeenCalledTimes( 5 );
		expect( spies.onBlur ).toHaveBeenCalledTimes( 3 );
	} );

	test( 'should throw if multiple child elements', () => {
		// React logs the expected render error to console.error; suppress it so real
		// warnings stay visible.
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		expect( () =>
			render(
				<TrackInputChanges onNewValue={ spies.onNewValue }>
					<DummyInput onChange={ spies.onChange } onBlur={ spies.onBlur } />
					<DummyInput onChange={ spies.onChange } onBlur={ spies.onBlur } />
				</TrackInputChanges>
			)
		).toThrow();

		consoleError.mockRestore();
	} );
} );
