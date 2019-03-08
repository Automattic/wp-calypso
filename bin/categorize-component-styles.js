const fs = require( 'fs' );
const path = require( 'path' );

const componentsStyle = fs.readFileSync( 'assets/stylesheets/_components.scss', {
	encoding: 'utf8',
} );
const components = componentsStyle
	.split( '\n' )
	.filter( line => line.startsWith( '@import' ) )
	.map( component => component.substring( 9, component.length - 2 ) );
console.log( components.length );

const zero = { score: 0 };

function hasImports( f ) {
	if ( f.includes( '@import' ) ) {
		return {
			score: 5,
			name: 'contains @import',
		};
	}
	return zero;
}

function hasExtend( f ) {
	if ( f.includes( '@extend' ) ) {
		return {
			score: 1,
			name: 'uses @extend',
		};
	}
	return zero;
}

function hasInclude( f ) {
	if ( f.includes( '@include' ) ) {
		return {
			score: 2,
			name: 'uses @include',
		};
	}
	return zero;
}

/**
 *
 * @param {String} f
 * @param {String} name
 */
function hasNonCompliantToplevelSelectors( f, name ) {
	let topLevelSelectors;
	const re = /^\.([\w_-]+)/gm;
	while ( ( topLevelSelectors = re.exec( f ) ) !== null ) {
		//console.log( topLevelSelectors[1] );
		if ( ! topLevelSelectors[ 1 ].startsWith( name ) ) {
			// suspect
			//console.log( 'saw %s, expected %s', topLevelSelectors[1], name );
			return {
				score: 3,
				name: 'odd top level selector',
			};
		}
	}

	return zero;
}

function score( c ) {
	const styles = fs.readFileSync( 'client/' + c + '.scss', { encoding: 'utf8' } );
	const name = path.basename( c.replace( /\/style$/, '' ) );
	//console.log( '\n%s', c );
	const checks = [ hasImports, hasExtend, hasInclude, hasNonCompliantToplevelSelectors ];
	const scores = checks.map( check => check( styles, name ) );
	scores.score = scores.reduce( ( totalScore, { score: s } ) => totalScore + s, 0 );
	return scores;
}

const scored = components.map( c => ( { component: c, scores: score( c ) } ) );

scored.sort( ( a, b ) => {
	const scoreDiff = b.scores.score - a.scores.score;
	if ( scoreDiff ) {
		return scoreDiff;
	}
	return a.component.localeCompare( b.component, 'en', { sensitivity: 'base' } );
} );

let currentScore = null;

for ( const s of scored ) {
	if ( currentScore !== s.scores.score ) {
		console.log( '' );
		console.log( 'SCORE:', s.scores.score );
		currentScore = s.scores.score;
	}
	console.log( s.component );
}
