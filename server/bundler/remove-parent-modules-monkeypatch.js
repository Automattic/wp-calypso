// I wish we didn't have to do this.
//
// originally from
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict"; //eslint-disable-line

var forEach = require( 'lodash/forEach' ),
	filter = require( 'lodash/filter' ),
	map = require( 'lodash/map' ),
	pullAll = require( 'lodash/pullAll' );

var RemoveParentModulesPlugin = require( 'webpack/lib/optimize/RemoveParentModulesPlugin' );
var Chunk = require( 'webpack/lib/Chunk' );
var Module = require( 'webpack/lib/Module' );

// not really necessary, but ... yeah
module.exports = RemoveParentModulesPlugin;

function hasModule( chunk, module, checkedChunks ) {
	// use the fancy new index to do lookups instead of indexOf
	// O(1) search vs O(n) search. Nested O(n) searches lead to n^level complexity
	if ( chunk._indexedModules.has( module.debugId ) ) {
		return [chunk];
	}
	if ( chunk.entry ) {
		return false;
	}
	const uncheckParents = filter( chunk.parents, function lookForChunk( c ) {
		// O(1) search against Set
		return ! checkedChunks.has( c );
	} );
	return allHaveModule( uncheckParents, module, checkedChunks );
}

function allHaveModule( someChunks, module, checkedChunks ) {
	// use Set here because we can use object identity for chunks and it gives us O(1) lookup
	if ( ! checkedChunks ) {
		checkedChunks = new Set();
	}
	let chunks = new Set();
	for ( let i = 0; i < someChunks.length; i++ ) {
		checkedChunks.add( someChunks[i] );
		const subChunks = hasModule( someChunks[i], module, checkedChunks );
		if ( ! subChunks ) {
			return false;
		}
		addToSet( chunks, subChunks );
	}
	return chunks;
}

function addToSet( set, items ) {
	forEach( items, function( item ) {
		set.add( item );
	} );
}

const oldAddModule = Chunk.prototype.addModule;
Chunk.prototype.addModule = function( module ) {
	( this._indexedModules = this._indexedModules || new Set() ).add( module.debugId );
	return oldAddModule.apply( this, arguments );
}

const oldRemoveModule = Chunk.prototype.removeModule;
Chunk.prototype.removeModule = function( module ) {
	this._indexedModules && this._indexedModules.delete( module.debugId );
	return oldRemoveModule.apply( this, arguments );
}

Chunk.prototype._calypso_removeModules = function( modules ) {
	// a shortcut for bulk module removal. avoid recopying the array for each module, just do it once.
	this.modules = pullAll( this.modules, modules );
	const indexed = this._indexedModules;
	forEach( modules, function( m ) {
		indexed.delete( m );
	} );
	forEach( modules, function( module ) {
		// shortcut for chunk removal to avoid calling back into the module
		module._calypso_removeChunk( this );
	} );
}

Module.prototype._calypso_removeChunk = function( chunk ) {
	// this is just like Module.removeChunk, but instead of calling back into each chunk to remove this module,
	// skip it, since this is _only_ called from the module removing the chunk. Normal module removal in a chunk does
	// a linear search to determine if the module is part of the chunk, so this avoids that search
	this.chunks = pullAll( this.chunks, chunk );
}

RemoveParentModulesPlugin.prototype.apply = function( compiler ) {
	compiler.plugin( 'compilation', function( compilation ) {
		compilation.plugin( [ 'optimize-chunks', 'optimize-extracted-chunks' ], function( chunks ) {
			//console.time( 'remove-parents' );
			/* So what are we doing here.
			 * We're walking each chunks modules
			 * If all of a chunk's parents have the module, remove it from the current chunks
			 * If the chunk is an entry point, ignore it
			 */
			forEach( chunks, function( chunk ) {
				//console.time( '  remove-parents-' + chunk.name );
				let removals = 0, modulesToPull = [];
				forEach( chunk.modules.slice(), function( module ) {
					if ( chunk.entry ) {
						return;
					}
					//console.time( '    find parents' );
					const parentChunksWithModule = allHaveModule( chunk.parents, module );
					//console.timeEnd( '    find parents' );
					if ( parentChunksWithModule ) {
						//console.time( '    rewrite chunk' );
						module.rewriteChunkInReasons( chunk, Array.from( parentChunksWithModule ) );
						//console.timeEnd( '    rewrite chunk' );
						modulesToPull.push( module );
						removals++;
					}
				} );

				if ( modulesToPull.length > 0 ) {
					chunk._calypso_removeModules( modulesToPull );
				}
			} );
			//console.timeEnd( 'remove-parents' );
		} );
	} );
};
