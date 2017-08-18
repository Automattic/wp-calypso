/* eslint strict: "off" */

'use strict';

const gitDiffRemoteVSHead = require( '../lib/git-diff' );
const gitDiffIndexVSHead = require( '../lib/git-diff-index' );

module.exports = function( remote, whatToDiff ) {
	let diff;
	if ( whatToDiff === 'index' ) {
		diff = gitDiffIndexVSHead();
	} else { // whatToDiff === 'remote'. This is the default.
		diff = gitDiffRemoteVSHead( remote );
	}

	return diff;
};
