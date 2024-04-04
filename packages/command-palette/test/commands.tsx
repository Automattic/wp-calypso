import { Command, COMMANDS } from '../src';

jest.mock( '../src/utils', () => ( {
	commandNavigation: ( path: string ) => () => path,
} ) );

// We are mocking the `commandNavigation` function to return the path above,
// so executing the callback should return the path.
const getNavigationPath = ( command: Command ) => command.callback();

describe( 'COMMANDS', () => {
	it( 'should be correctly defined', () => {
		expect( getNavigationPath( COMMANDS.viewMySites ) ).toEqual( '/sites' );
	} );
} );
