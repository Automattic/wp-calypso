/* eslint-disable jsdoc/check-tag-names */
/** @format */

const phrase = require( 'asana-phrase' );
const map = require( 'lodash' );

String.prototype.toProperCase = function () {
	return this.replace( /\w\S*/g, function ( txt ) {
		return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
	} );
};

function getRandomInt( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

exports.randomPhrase = function () {
	const gen = phrase.default32BitFactory().randomPhrase();
	return `${ gen[ 1 ].toProperCase() } ${ gen[ 2 ].toProperCase() } ${ gen[ 3 ].toProperCase() } ${ gen[ 4 ].toProperCase() }`;
};

exports.getNewBlogName = function () {
	return `e2eflowtesting${ new Date().getTime().toString() }${ getRandomInt( 100, 999 ) }desktop`;
};

exports.getExpectedFreeAddresses = async function ( searchTerm ) {
	const suffixes = [ '.wordpress.com', 'blog.wordpress.com', 'site.wordpress.com', '.home.blog' ];
	return map( suffixes, ( suffix ) => {
		return searchTerm + suffix;
	} );
};
