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
	const actualEnzyme = jest.requireActual( 'enzyme' );
	if ( ! mockEnzymeSetup ) {
		mockEnzymeSetup = true;

		// configure custom enzyme matchers for chai
		const chai = jest.requireActual( 'chai' );
		const chaiEnzyme = jest.requireActual( 'chai-enzyme' );
		chai.use( chaiEnzyme() );

		// configure custom Enzyme matchers for Jest
		jest.requireActual( 'jest-enzyme' );

		// configure enzyme 3 for React, from docs: http://airbnb.io/enzyme/docs/installation/index.html
		const Adapter = jest.requireActual( 'enzyme-adapter-react-16' );
		actualEnzyme.configure( { adapter: new Adapter() } );

		// configure snapshot serializer for enzyme
		const { createSerializer } = jest.requireActual( 'enzyme-to-json' );
		expect.addSnapshotSerializer( createSerializer( { mode: 'deep' } ) );
	}
	return actualEnzyme;
} );

// It "mocks" sinon, so that we can delay loading of
// the utility functions until sinon is imported in tests.
let mockSinonSetup = false;

jest.mock( 'sinon', () => {
	const actualSinon = jest.requireActual( 'sinon' );
	if ( ! mockSinonSetup ) {
		mockSinonSetup = true;

		// configure custom sinon matchers for chai
		const chai = jest.requireActual( 'chai' );
		const sinonChai = jest.requireActual( 'sinon-chai' );
		chai.use( sinonChai );
		actualSinon.assert.expose( chai.assert, { prefix: '' } );
	}
	return actualSinon;
} );
