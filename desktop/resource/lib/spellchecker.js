/*eslint new-cap: 0*/
var http = require( 'http' );
var parse_url = require( 'url' ).parse
var fs = require( 'fs' );
var mkdirp = require( 'mkdirp' )
var unzip = require( 'unzip' )
var path = require( 'path' )

function extract( remote, dir, fn ) {
	var dst_dir = path.join( dir, 'release', 'spellchecker' )
	var dst = path.join( dst_dir, path.basename( remote ) )
	return ensure_dir( dst_dir )
		.then( check_cache.bind( null, dst, function() {
			return request( remote ).then( write_stream.bind( null, dst ) )
		} ) )
		.then( unzip_path.bind( null, path.join( dir, 'node_modules', 'spellchecker', 'build' ) ) )
		.then( function() {
			setImmediate( fn )
		}, function( e ) {
			setImmediate( fn.bind( null, e ) )
		} )
}

function ensure_dir( dir ) {
	return new Promise( function( resolve, reject ) {
		mkdirp( dir, function( e ) {
			if ( e ) return reject( e );
			resolve( dir );
		} );
	} )
}

function check_cache( file, fetch ) {
	return new Promise( function( resolve, reject ) {
		fs.access( file, fs.R_OK, function( e ) {
			if ( e ) return fetch().then( function( downloaded ) {
				resolve( fs.createReadStream( downloaded ) )
			}, reject );
			resolve( fs.createReadStream( file ) )
		} )
	} );
}

function request( u ) {
	return new Promise( function( resolve, reject ) {
		console.log( 'Downloading', path.basename( u ) )
		http.request( parse_url( u ), function( response ) {
			if ( response.statusCode === 200 ) {
				resolve( response )
			} else {
				reject( new Error( 'Url ' + u + ' failed with status: ' + response.statusCode ) )
			}
		} )
		.on( 'error', reject )
		.end()
	} )
}

function write_stream( dst_path, read_str ) {
	return new Promise( function( resolve ) {
		var wrt_str = fs.createWriteStream( dst_path );
		read_str.pipe( wrt_str )
		.on( 'finish', function() {
			resolve( dst_path )
		} )
	} )
}

function unzip_path( dir, str ) {
	return new Promise( function( resolve ) {
		str.pipe( unzip.Extract( {path: dir} ) ).on( 'finish', function() {
			resolve( dir )
		} )
	} )
}

module.exports = function( url, dir, opts, fn ) {
	extract( url, dir, fn )
}
