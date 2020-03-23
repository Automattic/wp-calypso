/**
 * External dependencies
 */
const nock = require( 'nock' );

// Disables all network requests for all tests.
nock.disableNetConnect();

beforeAll( () => {
	// reactivate nock on test start
	if ( ! nock.isActive() ) {
		nock.activate();
	}
} );

afterAll( () => {
	// helps clean up nock after each test run and avoid memory leaks
	nock.restore();
	nock.cleanAll();
} );

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

		// configure custom Enzyme matchers for Jest
		require.requireActual( 'jest-enzyme' );

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
