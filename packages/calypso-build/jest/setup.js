const { configure } = require( 'enzyme' );
const Adapter = require( 'enzyme-adapter-react-16' );

configure( { adapter: new Adapter() } );

// This is used by @wordpress/components in https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/ui/utils/space.ts#L33
// JSDOM or CSSDOM don't provide an implementation for it, so for now we have to mock it.
global.CSS = {
	supports: jest.fn(),
};
