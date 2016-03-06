import useMockery from './use-mockery';
import glob from 'glob';
import mockery from 'mockery';
import path from 'path';

function findQuickMocks( dirpath ) {
	const fakes = glob.sync( '*/**/*.+(js|jsx)', {
		cwd: dirpath
	} );
	fakes.forEach( function( fake ) {
		const moduleName = fake.substring( fake, fake.lastIndexOf( '.' ) );
		mockery.registerSubstitute( moduleName, path.join( dirpath, fake ) );
	} );
}

export default function( dirpath, mockBase ) {
	useMockery( findQuickMocks.bind( null, dirpath, mockBase ), null );
}
