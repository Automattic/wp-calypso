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
	return ( lsb & lsbMask ) + ( ( msb & msbMask ) * Math.pow( 2, 28 ) );
}

function sortById( a, b ) {
	return a > b ? 1 : a < b ? -1 : 0; //eslint-disable-line no-nested-ternary
}

function getModuleSource( module ) {
	return {
		id: module.id,
		source: ( module._source || {} )._value || '',
		dependencies: ( module.dependencies || [] ).map( function( d ) {
			return d.module ? d.module.id : '';
		} )
	};
}

function concatenateSource( result, module ) {
	return result + '#' + module.id + ':' + module.source + '$' + ( module.dependencies.join( ',' ) );
}

function WebpackStableBuildPlugin( options ) {
	this.options = options || {};

	this.algorithm = options.algorithm || 'md5';
	this.digest = options.digest || 'hex';
}

WebpackStableBuildPlugin.prototype.apply = function( compiler ) {
	const usedChunkIds = {};
	const usedModuleIds = {};
	const context = compiler.options.context;
	const seed = ( +this.options.seed || 0 ) % 32;
	const hashSize = ( +this.options.hashSize || 53 );
	const _plugin = this;

	if ( hashSize > 53 ) {
		// In JavaScript, only integers up to 2^53 (exclusive) can be considered
		// safe, see http://www.2ality.com/2013/10/safe-integers.html
		throw new Error( 'hashSize too large' );
	}

	function genChunkId( chunkName ) {
		const hash = md5( chunkName );
		// generate a 28 bit integer using a part of the MD5 hash
		const id = hashToId( hash, seed, hashSize );
		if ( usedChunkIds.hasOwnProperty( id ) && usedChunkIds[ id ] !== chunkName ) {
			throw new Error( 'chunk id collision' );
		}
		return id;
	}

	function genModuleId( modulePath ) {
		const hash = md5( modulePath );
		// generate a 28 bit integer using a part of the MD5 hash
		const id = hashToId( hash, seed, hashSize );
		if ( usedModuleIds.hasOwnProperty( id ) && usedModuleIds[ id ] !== modulePath ) {
			throw new Error( 'module id collision' );
		}
		return id;
	}

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

		compilation.plugin( 'before-module-ids', function( modules ) {
			modules.forEach( function( module ) {
				if ( module.libIdent && module.id === null ) {
					const modulePath = module.libIdent( {
						context: context
					} );
					module.id = genModuleId( modulePath );
					usedModuleIds[ module.id ] = modulePath;
				}
			} );
		} );

		compilation.plugin( 'chunk-hash', function( chunk, chunkHash ) {
			const source = chunk.modules.map( getModuleSource ).sort( sortById ).reduce( concatenateSource, '' );
			const hash = crypto.createHash( _plugin.algorithm ).update( source );
			// have to include the seed to get different hashes for different seeds
			hash.update( seed.toString( 16 ) );

			chunkHash.digest = function( digest ) {
				return hash.digest( digest || _plugin.digest );
			};
		} );
	} );
};

module.exports = WebpackStableBuildPlugin;
