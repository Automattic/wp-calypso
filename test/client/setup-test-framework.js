/**
 * External dependencies
 */
import { disableNetConnect } from 'nock';

// It allows to use Mocha API with Jest
global.after = global.afterAll;
global.before = global.beforeAll;
global.context = global.describe;

// It disables all network requests for all tests.
disableNetConnect();

// It "mocks" enzyme, so that we can delay loading of
// the utility functions until enzyme is imported in tests.
// Props to @gdborton for sharing this technique in his article:
// https://medium.com/airbnb-engineering/unlocking-test-performance-migrating-from-mocha-to-jest-2796c508ec50.
let mockEnzymeSetup = false;

jest.mock( 'enzyme', () => {
	const chai = require( 'chai' );

	const actualEnzyme = require.requireActual( 'enzyme' );
	if ( ! mockEnzymeSetup ) {
		const chaiEnzyme = require( 'chai-enzyme' );
		if ( typeof chaiEnzyme === 'function' && ! mockEnzymeSetup ) {
			mockEnzymeSetup = true;
			chai.use( chaiEnzyme() );
		}
	}
	return actualEnzyme;
} );

// It "mocks" sinon, so that we can delay loading of
// the utility functions until sinon is imported in tests.
let mockSinonSetup = false;

jest.mock( 'sinon', () => {
	const chai = require( 'chai' );

	const actualSinon = require.requireActual( 'sinon' );
	if ( ! mockSinonSetup ) {
		const sinonChai = require.requireActual( 'sinon-chai' );
		if ( typeof sinonChai === 'function' && ! mockSinonSetup ) {
			mockSinonSetup = true;
			chai.use( sinonChai );
			actualSinon.assert.expose( chai.assert, { prefix: '' } );
		}
	}
	return actualSinon;
} );
