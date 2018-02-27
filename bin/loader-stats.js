#!/usr/bin/env node
const path = require( 'path' );
const stats = require( path.join( __dirname, '..', 'server', 'bundler', 'assets.json' ) );
const _ = require( 'lodash' );
const gzipSize = require( 'gzip-size' );



function getChunkByName( name ) {
	return stats.chunks.find( chunk => chunk.names.indexOf( name ) !== -1 );
}

function getChunkById( id ) {
	return stats.chunks.find( chunk => chunk.id === id );
}

function getChunkAndSiblings( which ) {
	const mainChunk = getChunkByName( which );
	return [
		mainChunk,
		...mainChunk.siblings.map( getChunkById )
	];
}

const sectionsToCheck = process.argv.slice(2);
const sectionChunks = _.compact( sectionsToCheck.map( getChunkByName ) );

if ( sectionChunks.length !== sectionsToCheck.length ) {
	console.log( `bad section chunk name` );
}

const sectionsToLoad = [];
sectionsToLoad.push({
	name: 'boot',
	chunks: getChunkAndSiblings('build')
});
sectionChunks.forEach(section => {
	sectionsToLoad.push({
		name: section.names.join(','),
		chunks: _.difference(getChunkAndSiblings(section.names[0]), _.flatMap(sectionsToLoad, section => section.chunks))
	});
});


filesToLoadPerSection = sectionsToLoad.map(section => {
	return {
		name: section.name,
		filesToLoad: _.flatMap(section.chunks, chunk => {
			return chunk.files.map(file => path.join(__dirname, '..', 'public', file.replace('/calypso/', '')));
		})
	}
});

async function calculateSizes( section ) {
	const fileSizePromises = section.filesToLoad.map( f => gzipSize.file( f ) );

	const fileSizes = await Promise.all( fileSizePromises );

	const filesWithSizes = _.zipObject( section.filesToLoad, fileSizes );

	console.log( `${section.name}:` );

	section.filesToLoad.forEach( f => {
		console.log( `   ${f}: (${ filesWithSizes[ f ] / 1000 }kb)`);
	})

	console.log("Total: " + (section.filesToLoad.reduce((totalSize, f) => totalSize + filesWithSizes[f], 0) / 1000) + "kb");
	console.log('');
}

async function go() {
	for (section in filesToLoadPerSection) {
		await calculateSizes(filesToLoadPerSection[ section ]);
	}
}

go();



