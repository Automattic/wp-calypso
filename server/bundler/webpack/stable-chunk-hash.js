const crypto = require( 'crypto' );

module.exports = WebpackStableChunkHash;

function WebpackStableChunkHash( options ) {
	options = options || {};

	this.algorithm = options.algorithm || 'md5';
	this.digest = options.digest || 'hex';
}

function _collectChunkIds( chunks, ids ) {
	const chunkIds = ids || new Set();

	chunks && chunks.forEach( function( chunk ) {
		chunk.ids.forEach( function( id ) {
			chunkIds.add( id );
		} );
		if ( chunk.chunks.length ) {
			collectChunkIds( chunk.chunks, chunkIds );
		}
	} );

	return chunkIds;
}

function collectChunkIds( chunk ) {
	return Array.from(
		_collectChunkIds( chunk.chunks, new Set() )
	).sort();
}

WebpackStableChunkHash.prototype.apply = function( compiler ) {
	const _plugin = this;

	compiler.plugin( 'compilation', function( compilation ) {
		compilation.plugin( 'chunk-hash', function( chunk, chunkHash ) {
			const source = chunk.modules.map( getModuleSource ).sort( sortById ).reduce( concatenateSource, '' );
			const hash = crypto.createHash( _plugin.algorithm ).update(
				source + collectChunkIds( chunk )
			);

			chunkHash.digest = function( digest ) {
				return hash.digest( digest || _plugin.digest );
			};
		} );
	} );
};

// helpers

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
