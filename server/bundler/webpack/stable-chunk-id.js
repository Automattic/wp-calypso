const crypto = require( 'crypto' );

const md5Cache = {};

function md5( content ) {
	if ( ! md5Cache[ content ] ) {
		md5Cache[ content ] = crypto.createHash( 'md5' ).update( content, 'utf-8' ).digest( 'hex' );
	}
	return md5Cache[ content ];
}

function hashToModuleId( hash, seed, hashSize ) {
    // Generate a unsigned integer sized <hashSize> bits using a part of the MD5
    // hash. Seed is a number 0..31 and the hash is expected to be 32 chars
    // (nibbles) long.

    // double the hash to allow overflow
	hash = hash + hash;

    // get lower and upper 28 bits
	const lsb = parseInt( hash.substr( seed, 7 ), 16 );
	const msb = parseInt( hash.substr( seed + 7, 7 ), 16 );

    // combine them to get the ID
    // NOTE: Logical operators only work up to 31 bits (because values will be
    // casted to 32bit signed integer), so we use classic arithmetic!
	const lsbBits = Math.min( 28, hashSize );
	const msbBits = Math.max( 0, hashSize - 28 );
	const lsbMask = Math.pow( 2, lsbBits ) - 1;
	const msbMask = Math.pow( 2, msbBits ) - 1;
	return ( lsb & lsbMask ) + ( ( msb & msbMask ) * Math.pow( 2, 28 ) );
}

function WebpackStableChunkId( options ) {
	this.options = options || {};
}

WebpackStableChunkId.prototype.apply = function( compiler ) {
	const usedChunkIds = {};
	const seed = ( +this.options.seed || 0 ) % 32;
	const hashSize = ( +this.options.hashSize || 53 );

	if ( hashSize > 53 ) {
        // In JavaScript, only integers up to 2^53 (exclusive) can be considered
        // safe, see http://www.2ality.com/2013/10/safe-integers.html
		throw new Error( 'hashSize too large' );
	}

	function genChunkId( chunkName ) {
		const hash = md5( chunkName );
      // generate a 28 bit integer using a part of the MD5 hash
		const id = hashToModuleId( hash, seed, hashSize );
		if ( usedChunkIds.hasOwnProperty( id ) && usedChunkIds[ id ] !== chunkName ) {
			throw new Error( 'chunk id collision' );
		}
		return id;
	}

    // Generate module id by md5 value of file path.

    // Since webpack 1.x can not use a non-number as a module id,
    // convert the md5 (hex) to unique number.

    // spooned from https://github.com/webpack/webpack/blob/master/lib/HashedModuleIdsPlugin.js
	compiler.plugin( 'compilation', function( compilation ) {
		compilation.plugin( 'before-chunk-ids', function( chunks ) {
			chunks.forEach( function( chunk ) {
				const chunkName = chunk.name;
				if ( ! chunkName ) {
					return;
				}
				chunk.id = genChunkId( chunkName );
				usedChunkIds[ chunk.id ] = chunkName;
			} );
		} );
	} );
};

module.exports = WebpackStableChunkId;
