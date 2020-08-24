/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

const directory = './temp-cookies';

export async function saveLogin( driver, username ) {
	const cookieFile = `${ directory }/${ username }.json`;
	if ( await fs.existsSync( cookieFile ) ) {
		return;
	}

	createDir( directory );
	await driver.get( 'https://public-api.wordpress.com/wp-admin/' );
	const cookies = await driver.manage().getCookies();
	await fs.writeFileSync( cookieFile, JSON.stringify( cookies ), 'utf-8' );
	await driver.navigate().back();
}

export async function loadLoginCookies( driver, filePath ) {
	const rawData = await fs.readFileSync( filePath );
	const cookies = await JSON.parse( rawData );
	for ( const cookie of cookies ) {
		await driver.manage().addCookie( cookie );
	}
}

export async function useLoginCookies( driver, username ) {
	const cookiePath = `${ directory }/${ username }.json`;
	let usedCookie = false;
	if ( fs.existsSync( cookiePath ) ) {
		const stats = fs.statSync( cookiePath );
		const expireDate = new Date( Date.now() - 7 * 86400000 );
		if ( expireDate < stats.mtime ) {
			await loadLoginCookies( driver, cookiePath );
			usedCookie = true;
		} else {
			fs.unlink( cookiePath, function ( err ) {
				if ( err ) {
					console.log( 'Deleting of login cookies failed' );
				}
			} );
		}
	}

	return usedCookie;
}

function createDir( dir ) {
	dir = path.resolve( dir );
	if ( fs.existsSync( dir ) ) return dir;
	try {
		fs.mkdirSync( dir );
		return dir;
	} catch ( error ) {
		if ( error.code === 'ENOENT' ) {
			return createDir( path.dirname( dir ) ) && createDir( dir );
		}
		throw error;
	}
}
