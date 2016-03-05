import wrap from './wrap';
import glob from 'glob';
import mockery from 'mockery';

function findQuickMocks( dirpath, mockBase ) {
	const fakes = glob.sync( '*/**/*.+(js|jsx)', {
		cwd: dirpath
	} );
	fakes.forEach( function( fake ) {
		const moduleName = fake.substring( fake, fake.lastIndexOf( '.' ) );
		console.log( 'found quick mock %s => %s', moduleName, `${mockBase}/${moduleName}` );
		const mock = require( `${mockBase}/${moduleName}` );
		if ( !mock ) {
			throw new Error( 'can not find mock ' + `${mockBase}/${moduleName}` );
		}
		mockery.registerMock( moduleName, mock );
	} );
}

export default function( dirpath, mockBase ) {
	wrap( findQuickMocks.bind( null, dirpath, mockBase ), null );
}
