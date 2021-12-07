const Adapter = require( '@wojtekmaj/enzyme-adapter-react-17' );
const { configure } = require( 'enzyme' );

configure( { adapter: new Adapter() } );

// This is used by @wordpress/components in https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/ui/utils/space.ts#L33
// JSDOM or CSSDOM don't provide an implementation for it, so for now we have to mock it.
global.CSS = {
	supports: jest.fn(),
};
