import '@testing-library/jest-dom';

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

		// configure custom Enzyme matchers for Jest
		jest.requireActual( 'jest-enzyme' );

		// configure enzyme 3 for React, from docs: http://airbnb.io/enzyme/docs/installation/index.html
		const Adapter = jest.requireActual( '@wojtekmaj/enzyme-adapter-react-17' );
		actualEnzyme.configure( { adapter: new Adapter() } );

		// configure snapshot serializer for enzyme
		const { createSerializer } = jest.requireActual( 'enzyme-to-json' );
		expect.addSnapshotSerializer( createSerializer( { mode: 'deep' } ) );
	}
	return actualEnzyme;
} );

// This is used by @wordpress/components in https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/ui/utils/space.ts#L33
// JSDOM or CSSDOM don't provide an implementation for it, so for now we have to mock it.
global.CSS = {
	supports: jest.fn(),
};

// Don't need to mock specific functions for any tests, but mocking
// module because it accesses the `document` global.
jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
} ) );
