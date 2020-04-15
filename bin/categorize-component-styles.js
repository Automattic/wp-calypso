const fs = require( 'fs' );
const path = require( 'path' );

const componentsStyle = fs.readFileSync( 'assets/stylesheets/_components.scss', {
	encoding: 'utf8',
} );
const components = componentsStyle
	.split( '\n' )
	.filter( ( line ) => line.startsWith( '@import' ) )
	.map( ( component ) => component.substring( 9, component.length - 2 ) );
console.log( `Scoring ${ components.length } components...` );

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

/**
 *
 * @param {string} f
 * @param {string} name
 */
function hasNonCompliantToplevelSelectors( f, name ) {
	let topLevelSelectors;
	const re = /^\.([\w_\-.]+)/gm;
	let violations = 0;
	while ( ( topLevelSelectors = re.exec( f ) ) !== null ) {
		const classes = topLevelSelectors[ 0 ].split( '.' ).filter( Boolean );

		if ( ! classes.some( ( cls ) => cls.startsWith( name ) ) ) {
			// suspect
			//console.log( '  saw %s\n  expected %s', topLevelSelectors[0], name );
			++violations;
		}
	}

	if ( violations ) {
		return {
			score: violations,
			name: 'non-compliant top level selectors',
		};
	}

	return zero;
}

const childProcess = require( 'child_process' );
function overridenByOthers( f, name, componentPath ) {
	const results = childProcess.spawnSync(
		'git',
		[
			'grep',
			'-l',
			'-F',
			`.${ name }`,
			'--',
			`"*.scss"`,
			`":^${ componentPath }"`,
			':^assets/stylesheets/shared/functions/_z-index.scss',
		],
		{ encoding: 'utf8', shell: true }
	);
	const r = results.stdout.split( '\n' );
	const componentsFullPath = components.map( ( c ) => 'client/' + c + '.scss' );
	const matches = r.filter( ( p ) => componentsFullPath.includes( p ) );
	const matchCount = matches.length;
	if ( matchCount > 0 ) {
		return {
			score: matchCount,
			name: `styles overriden by ${ matchCount } consumers:\n\t${ matches.join( '\n\t' ) }`,
		};
	}
	return zero;
}

function score( c ) {
	const styles = fs.readFileSync( 'client/' + c + '.scss', { encoding: 'utf8' } );
	const name = path.basename( c.replace( /\/style$/, '' ) );
	const componentPath = `client/${ path.dirname( c ) }/`;
	const checks = [ hasImports, hasNonCompliantToplevelSelectors, overridenByOthers ];
	const scores = checks.map( ( check ) => check( styles, name, componentPath ) );
	scores.score = scores.reduce( ( totalScore, { score: s } ) => totalScore + s, 0 );
	scores.summary = scores
		.filter( ( s ) => s.name )
		.map( ( s ) => s.name )
		.join( ', ' );
	return scores;
}

const scored = components.map( ( c ) => ( { component: c, scores: score( c ) } ) );

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
	if ( s.scores.summary ) {
		console.log( '  ', s.scores.summary );
	}
}
