require( '@wordpress/jest-console' );

// It "mocks" enzyme, so that we can delay loading of
// the utility functions until enzyme is imported in tests.
// Props to @gdborton for sharing this technique in his article:
// https://medium.com/airbnb-engineering/unlocking-test-performance-migrating-from-mocha-to-jest-2796c508ec50.
let mockEnzymeSetup = false;

jest.mock( 'enzyme', () => {
	const actualEnzyme = require.requireActual( 'enzyme' );
	if ( ! mockEnzymeSetup ) {
		mockEnzymeSetup = true;

		// configure enzyme 3 for React, from docs: http://airbnb.io/enzyme/docs/installation/index.html
		const Adapter = require.requireActual( 'enzyme-adapter-react-16' );
		actualEnzyme.configure( { adapter: new Adapter() } );

		// configure assertions for enzyme
		require.requireActual( 'jest-enzyme' );
	}
	return actualEnzyme;
} );
