/**
 * External dependencies
 */
import { assign, constant, mapValues, zipObject } from 'lodash';
import assert from 'assert';

/**
 * Internal dependencies
 */
import formState from '../';

function checkNthState( n, callback ) {
	let count = 0;

	return function ( state ) {
		if ( count === n ) {
			callback( state );
		}

		count++;
	};
}

function testController( options ) {
	let fieldNames, defaults;

	fieldNames = options.fieldNames;

	defaults = {
		loadFunction: function ( onComplete ) {
			const fieldValues = zipObject( fieldNames, fieldNames.map( constant( 'loaded' ) ) );
			onComplete( null, fieldValues );
		},

		validatorFunction: function ( fieldValues, onComplete ) {
			const fieldErrors = mapValues( fieldValues, constant( [] ) );
			onComplete( null, fieldErrors );
		},

		onNewState: function () {},

		debounceWait: 0,
	};

	return formState.Controller( assign( defaults, options ) );
}

describe( 'index', () => {
	describe( '#Controller', () => {
		describe( '#getInitialState', () => {
			test( 'returns disabled fields', () => {
				let controller = testController( { fieldNames: [ 'firstName' ] } ),
					state = controller.getInitialState();

				assert.strictEqual( formState.isFieldDisabled( state, 'firstName' ), true );
			} );
		} );

		test( 'enables the fields on the first event', ( done ) => {
			let onNewState;

			onNewState = checkNthState( 0, function ( state ) {
				assert.strictEqual( formState.isFieldDisabled( state, 'firstName' ), false );
				done();
			} );

			testController( {
				fieldNames: [ 'firstName' ],
				onNewState: onNewState,
			} );
		} );

		describe( '#handleFieldChange', () => {
			test( 'updates the field value', ( done ) => {
				let onNewState, controller;

				onNewState = checkNthState( 1, function ( state ) {
					assert.strictEqual( formState.getFieldValue( state, 'firstName' ), 'foo' );
					done();
				} );

				controller = testController( {
					fieldNames: [ 'firstName' ],
					onNewState: onNewState,
				} );

				controller.handleFieldChange( {
					name: 'firstName',
					value: 'foo',
				} );
			} );

			test( 'validates the new value', ( done ) => {
				let validatorFunction, onNewState, controller;

				validatorFunction = function ( fieldValues, onComplete ) {
					onComplete( null, { firstName: [ 'invalid' ] } );
				};

				onNewState = checkNthState( 3, function ( state ) {
					assert.deepEqual( formState.getErrorMessages( state ), [ 'invalid' ] );
					done();
				} );

				controller = testController( {
					fieldNames: [ 'firstName' ],
					validatorFunction: validatorFunction,
					onNewState: onNewState,
				} );

				controller.handleFieldChange( {
					name: 'firstName',
					value: 'foo',
				} );
			} );

			describe( 'when there are multiple changes at once', () => {
				test( 'only shows errors for the latest values', ( done ) => {
					let validatorFunction, onNewState, controller;

					validatorFunction = function ( fieldValues, onComplete ) {
						onComplete( null, {
							firstName: fieldValues.firstName.length > 0 ? [] : [ 'invalid' ],
						} );
					};

					onNewState = checkNthState( 4, function ( state ) {
						assert.deepEqual( formState.getErrorMessages( state ), [ 'invalid' ] );
						done();
					} );

					controller = testController( {
						fieldNames: [ 'firstName' ],
						validatorFunction: validatorFunction,
						onNewState: onNewState,
					} );

					controller.handleFieldChange( {
						name: 'firstName',
						value: 'foo',
					} );

					controller.handleFieldChange( {
						name: 'firstName',
						value: '',
					} );
				} );
			} );
		} );
	} );
} );
