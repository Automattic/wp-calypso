/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import config from '../';

const NODE_ENV = process.env.NODE_ENV;
const fakeKey = 'where did all the errors go?';

describe( '#config', () => {
	afterEach( () => process.env.NODE_ENV = NODE_ENV );

	it( `should throw an error when given key doesn't exist (NODE_ENV == development)`, () => {
		process.env.NODE_ENV = 'development';

		expect( () => config( fakeKey ) ).to.throw( ReferenceError );
	} );

	it( `should not throw an error when given key doesn't exist (NODE_ENV != development)`, () => {
		const envs = [
			'client',
			'desktop',
			'horizon',
			'production',
			'stage',
			'test',
			'wpcalypso',
		];

		envs.forEach( env => {
			process.env.NODE_ENV = env;

			expect( process.env.NODE_ENV ).to.equal( env );
			expect( () => config( fakeKey ) ).to.not.throw( Error );
		} );
	} );
} );
