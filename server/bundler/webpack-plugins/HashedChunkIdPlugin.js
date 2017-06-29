/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
const crypto = require( 'crypto' );

const md5Cache = {};

function md5( content ) {
	if ( ! md5Cache[ content ] ) {
		md5Cache[ content ] = crypto.createHash( 'md5' ).update( content, 'utf-8' ).digest( 'hex' );
	}
	return md5Cache[ content ];
}

function hashToId( hash, seed, hashSize ) {
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
	return ( lsb & lsbMask ) + ( msb & msbMask ) * Math.pow( 2, 28 );
}

class HashedChunkIdPlugin {
	apply( compiler ) {
		const usedChunkIds = {};

		function genChunkId( chunkName ) {
			const hash = md5( chunkName );
			// generate a 28 bit integer using a part of the MD5 hash
			const id = hashToId( hash, 0, 53 );
			if ( usedChunkIds.hasOwnProperty( id ) && usedChunkIds[ id ] !== chunkName ) {
				throw new Error( 'chunk id collision' );
			}
			return id;
		}

		compiler.plugin( 'compilation', compilation => {
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
	}
}

module.exports = HashedChunkIdPlugin;
