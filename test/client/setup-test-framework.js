/** @format */

/**
 * External dependencies
 */
import jsonSchema from './jsonschema-draft-04';
import validator from 'is-my-json-valid';
import { disableNetConnect } from 'nock';
import { forEach, get, isEmpty } from 'lodash';

// It disables all network requests for all tests.
disableNetConnect();

// It "mocks" enzyme, so that we can delay loading of
// the utility functions until enzyme is imported in tests.
// Props to @gdborton for sharing this technique in his article:
// https://medium.com/airbnb-engineering/unlocking-test-performance-migrating-from-mocha-to-jest-2796c508ec50.
let mockEnzymeSetup = false;

jest.mock( 'enzyme', () => {
	const actualEnzyme = require.requireActual( 'enzyme' );
	if ( ! mockEnzymeSetup ) {
		mockEnzymeSetup = true;

		// configure custom enzyme matchers for chai
		const chai = require.requireActual( 'chai' );
		const chaiEnzyme = require.requireActual( 'chai-enzyme' );
		chai.use( chaiEnzyme() );

		// configure enzyme 3 for React, from docs: http://airbnb.io/enzyme/docs/installation/index.html
		const Adapter = require.requireActual( 'enzyme-adapter-react-16' );
		actualEnzyme.configure( { adapter: new Adapter() } );

		// configure snapshot serializer for enzyme
		const { createSerializer } = require.requireActual( 'enzyme-to-json' );
		expect.addSnapshotSerializer( createSerializer( { mode: 'deep' } ) );
	}
	return actualEnzyme;
} );

// It "mocks" sinon, so that we can delay loading of
// the utility functions until sinon is imported in tests.
let mockSinonSetup = false;

jest.mock( 'sinon', () => {
	const actualSinon = require.requireActual( 'sinon' );
	if ( ! mockSinonSetup ) {
		mockSinonSetup = true;

		// configure custom sinon matchers for chai
		const chai = require.requireActual( 'chai' );
		const sinonChai = require.requireActual( 'sinon-chai' );
		chai.use( sinonChai );
		actualSinon.assert.expose( chai.assert, { prefix: '' } );
	}
	return actualSinon;
} );

const validateSchema = validator( jsonSchema, { verbose: true, greedy: true } );

expect.extend( {
	toBeValidSchema( received, expected ) {
		this.utils.ensureNoExpected( expected, '.toBeValidSchema' );
		const pass = validateSchema( received );

		const testMessage = pass
			? /* Error message for valid schema that should not be. */ () =>
					[
						this.utils.matcherHint( '.not.toBeValidSchema', 'schema', '' ),
						'',
						`Expected ${ this.utils.printReceived( received ) } not to be a valid schema.`,
					].join( '\n' )
			: /* Error message for invalid schema that should be valid */ () => {
					const msg = [
						this.utils.matcherHint( '.toBeValidSchema', 'schema', '' ),
						'',
						`expected ${ this.utils.printReceived( received ) } to be a valid schema`,
						'',
					];
					forEach( validateSchema.errors, ( { field, message, schemaPath, value } ) => {
						// data.myField is required
						msg.push( `${ field } ${ message }` );

						// Found: { my: 'state' }
						msg.push( `Found: ${ JSON.stringify( value ) }` );

						// Violates rule: { type: 'boolean' }
						if ( ! isEmpty( schemaPath ) ) {
							msg.push( `Violates rule: ${ JSON.stringify( get( jsonSchema, schemaPath ) ) }` );
						}
						msg.push( '' );
					} );
					return msg.join( '\n' );
				};
		return {
			actual: received,
			message: testMessage,
			pass,
		};
	},
} );
