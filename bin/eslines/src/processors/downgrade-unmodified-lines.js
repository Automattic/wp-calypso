const fs = require( 'fs' );
const downgradeUnmodifiedLines = require( '../lib/downgrade-unmodified-lines' );
const differ = require( '../lib/differ' );
const gitDiffCalculator = require( '../lib/git-diff-calculator' );

const config = JSON.parse( fs.readFileSync( '.eslines.json', 'utf-8' ) );

module.exports = function( report ) {
	const remote = config.processors[ 'downgrade-unmodified-lines' ].remote || 'origin/master';
	const whatToDiff = process.env.ESLINES_DIFF;
	const lines = differ( gitDiffCalculator( remote, whatToDiff ) );

	const rulesNotToDowngrade = config.processors[ 'downgrade-unmodified-lines' ].rulesNotToDowngrade || []; // eslint-disable-line max-len
	return JSON.stringify( downgradeUnmodifiedLines( report, lines, rulesNotToDowngrade ) );
};
