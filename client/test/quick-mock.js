import useMockery from './use-mockery';
import glob from 'glob';
import mockery from 'mockery';
import path from 'path';
import debug from 'debug';

const log = debug( 'calypso:test:quick-mock' );

function findQuickMocks( dirpath ) {
	const fakes = glob.sync( '*/**/*.+(js|jsx)', {
		cwd: dirpath
	} );
	fakes.forEach( function( fake ) {
		const moduleName = fake.substring( fake, fake.lastIndexOf( '.' ) ),
			fakePath = path.join( dirpath, fake );
		log( 'registering %s -> %s', moduleName, fakePath );
		mockery.registerSubstitute( moduleName, fakePath );
	} );
}

export default function( dirpath, mockBase ) {
	useMockery( findQuickMocks.bind( null, dirpath, mockBase ), null );
}
