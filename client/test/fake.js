import wrap from './wrap';
import glob from 'glob';
import mockery from 'mockery';
import path from 'path';

function findQuickMocks( dirpath ) {
	const fakes = glob.sync( '*/**/*.+(js|jsx)', {
		cwd: dirpath
	} );
	fakes.forEach( function( fake ) {
		const moduleName = fake.substring( fake, fake.lastIndexOf( '.' ) );
		console.log( 'found quick mock %s => %s', moduleName, path.join( dirpath, fake ) );
		mockery.registerSubstitute( moduleName, path.join( dirpath, fake ) );
	} );
}

export default function( dirpath, mockBase ) {
	wrap( findQuickMocks.bind( null, dirpath, mockBase ), null );
}
