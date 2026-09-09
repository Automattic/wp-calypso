const { createReadStream, existsSync, readFileSync } = require( 'fs' );
const { resolve, join } = require( 'path' );
const streamJson = require( 'stream-json' );

const [ trunkDir, branchDir ] = process.argv.slice( 2 );

if ( ! trunkDir || ! branchDir ) {
	console.error( 'Usage: yarn run compare-icfy <trunk-stats-dir> <branch-stats-dir>' );
	process.exit( 1 );
}

for ( const dir of [ trunkDir, branchDir ] ) {
	for ( const file of [ 'stats.json', 'chart.json' ] ) {
		if ( ! existsSync( join( dir, file ) ) ) {
			console.error( `Compare: ${ dir }/${ file } not found` );
			process.exit( 1 );
		}
	}
}

// Load a JSON file from the file system.
function loadJson( filePath ) {
	return JSON.parse( readFileSync( resolve( filePath ), 'utf8' ) );
}

// Which properties of stats.json to keep while streaming it.
function matchingProp( name ) {
	switch ( name.length ) {
		case 1:
			return name[ 0 ] === 'chunks' || name[ 0 ] === 'namedChunkGroups';
		case 2:
			return (
				( name[ 0 ] === 'chunks' && ( name[ 1 ] === 'id' || name[ 1 ] === 'names' ) ) ||
				name[ 0 ] === 'namedChunkGroups'
			);
		case 3:
			return name[ 0 ] === 'namedChunkGroups' && name[ 2 ] === 'chunks';
		default:
			return false;
	}
}

// stats.json is far too large to read into a single string, so it's streamed and
// only the handful of properties the comparison needs are kept.
function parseStats( filename ) {
	const inputStream = createReadStream( filename, { encoding: 'utf8' } );
	const jsonStream = streamJson.parser();
	inputStream.pipe( jsonStream );

	const outputStack = [];
	const propStack = [];
	let shouldStore = false;
	let output;

	function store( value ) {
		if ( outputStack.length === 0 ) {
			output = value;
			return;
		}

		const target = outputStack.at( -1 );
		if ( Array.isArray( target ) ) {
			if ( shouldStore ) {
				target.push( value );
			}
		} else {
			const prop = propStack.pop();
			if ( shouldStore ) {
				target[ prop ] = value;
			}
			shouldStore = matchingProp( propStack );
		}
	}

	jsonStream.on( 'data', ( { name, value } ) => {
		switch ( name ) {
			case 'keyValue':
				propStack.push( value );
				shouldStore = matchingProp( propStack );
				break;
			case 'startObject':
				outputStack.push( {} );
				break;
			case 'startArray':
				outputStack.push( [] );
				break;
			case 'endObject':
			case 'endArray':
				store( outputStack.pop() );
				break;
			case 'stringValue':
			case 'numberValue':
				store( value );
				break;
			case 'nullValue':
				store( null );
				break;
			case 'trueValue':
				store( true );
				break;
			case 'falseValue':
				store( false );
				break;
			default:
				break;
		}
	} );

	return new Promise( ( resolveStats, reject ) => {
		jsonStream.on( 'end', () => resolveStats( output ) );
		jsonStream.on( 'error', reject );
		inputStream.on( 'error', reject );
	} );
}

function analyzeBundle( stats, chart ) {
	const chunkStats = chart.map( ( asset ) => {
		const [ chunk, hash ] = asset.label.split( '.' );
		return {
			chunk,
			hash,
			stat_size: asset.statSize,
			parsed_size: asset.parsedSize,
			gzip_size: asset.gzipSize,
		};
	} );

	const chunkNames = Object.fromEntries(
		stats.chunks.map( ( chunk ) => [ chunk.id, chunk.names ] )
	);
	const getName = ( id ) => chunkNames[ id ]?.[ 0 ] ?? id;

	const chunkGroups = Object.entries( stats.namedChunkGroups ).flatMap(
		( [ groupName, { chunks } ] ) =>
			chunks.map( ( chunk ) => ( {
				chunk: groupName,
				sibling: getName( chunk ),
			} ) )
	);

	return { chunkStats, chunkGroups };
}

async function loadBundle( dir ) {
	const stats = await parseStats( join( dir, 'stats.json' ) );
	const chart = loadJson( join( dir, 'chart.json' ) );
	return analyzeBundle( stats, chart );
}

// -- Delta computation --

const SIZES = [ 'stat_size', 'parsed_size', 'gzip_size' ];
const ZERO_SIZE = Object.fromEntries( SIZES.map( ( s ) => [ s, 0 ] ) );

function mapValues( sizes, fn ) {
	return Object.fromEntries(
		Object.entries( sizes ).map( ( [ key, value ] ) => [ key, fn( value, key ) ] )
	);
}

function sizesOf( stat ) {
	return stat ? Object.fromEntries( SIZES.map( ( s ) => [ s, stat[ s ] ] ) ) : null;
}

function sumSizesOf( a, b ) {
	if ( ! a ) {
		return b;
	}
	if ( ! b ) {
		return a;
	}
	return Object.fromEntries( SIZES.map( ( s ) => [ s, a[ s ] + b[ s ] ] ) );
}

function deltaSizesOf( first, second ) {
	if ( ! first ) {
		return second;
	}
	if ( ! second ) {
		return mapValues( first, ( v ) => -v );
	}
	return mapValues( first, ( v, key ) => second[ key ] - v );
}

function deltaPercentsOf( first, delta ) {
	if ( ! first ) {
		return null;
	}
	return mapValues( first, ( v, key ) => ( v ? ( delta[ key ] / v ) * 100 : null ) );
}

function sortByDelta( deltas ) {
	return deltas
		.slice()
		.sort( ( a, b ) => Math.abs( a.deltaSizes.parsed_size ) - Math.abs( b.deltaSizes.parsed_size ) )
		.reverse();
}

// -- Chunk groups: dedupe and delta --

function sameChunkSet( a, b ) {
	return a.size === b.size && [ ...a ].every( ( chunk ) => b.has( chunk ) );
}

function groupGroups( groups ) {
	const grouped = {};
	for ( const record of groups ) {
		if ( ! grouped[ record.chunk ] ) {
			grouped[ record.chunk ] = new Set();
		}
		grouped[ record.chunk ].add( record.sibling );
	}

	// Remove duplicate group names that map to identical chunk sets.
	const equalGroups = [];
	for ( const [ groupName, chunkSet ] of Object.entries( grouped ) ) {
		const entry = equalGroups.find( ( r ) => sameChunkSet( r.chunkSet, chunkSet ) );
		if ( entry ) {
			entry.groupNames.push( groupName );
		} else {
			equalGroups.push( { chunkSet, groupNames: [ groupName ] } );
		}
	}
	const toRemove = new Set(
		equalGroups.flatMap( ( { groupNames } ) => {
			if ( groupNames.length < 2 ) {
				return [];
			}
			const shortest = groupNames.reduce( ( a, b ) => ( b.length < a.length ? b : a ) );
			return groupNames.filter( ( n ) => n !== shortest );
		} )
	);

	return Object.entries( grouped )
		.filter( ( [ group ] ) => ! toRemove.has( group ) )
		.map( ( [ group, chunkSet ] ) => ( {
			group,
			chunks: [ ...chunkSet ],
		} ) );
}

function sizesOfGroup( group, stats ) {
	if ( ! group ) {
		return null;
	}
	return group.chunks
		.map( ( chunk ) => sizesOf( stats.find( ( stat ) => stat.chunk === chunk ) ) )
		.reduce( sumSizesOf );
}

function deltaFromGroups( firstStats, firstRawGroups, secondStats, secondRawGroups ) {
	const firstGroups = groupGroups( firstRawGroups );
	const secondGroups = groupGroups( secondRawGroups );

	// The runtime is a member of every entrypoint group. Report it on its own,
	// so that it doesn't show up as a change of each entrypoint.
	for ( const [ stats, groups ] of [
		[ firstStats, firstGroups ],
		[ secondStats, secondGroups ],
	] ) {
		if ( stats.some( ( stat ) => stat.chunk === 'runtime' ) ) {
			for ( const g of groups ) {
				g.chunks = g.chunks.filter( ( c ) => c !== 'runtime' );
			}
			groups.push( { group: 'runtime', chunks: [ 'runtime' ] } );
		}
	}

	const deltas = [];

	for ( const first of firstGroups ) {
		const second = secondGroups.find( ( group ) => group.group === first.group );
		const name = ( second || first ).group;
		const firstSizes = sizesOfGroup( first, firstStats );
		const secondSizes = sizesOfGroup( second, secondStats );
		const deltaSizes = deltaSizesOf( firstSizes, secondSizes );
		const deltaPercents = deltaPercentsOf( firstSizes, deltaSizes );

		if ( Math.abs( deltaSizes?.parsed_size ?? 0 ) > 10 ) {
			deltas.push( {
				name,
				firstSizes,
				secondSizes,
				deltaSizes,
				deltaPercents,
				firstChunks: first.chunks,
				secondChunks: second?.chunks ?? [],
			} );
		}
	}

	for ( const second of secondGroups ) {
		if ( ! firstGroups.find( ( group ) => group.group === second.group ) ) {
			const name = second.group;
			const secondSizes = sizesOfGroup( second, secondStats );
			const deltaSizes = deltaSizesOf( null, secondSizes );
			deltas.push( {
				name,
				firstSizes: null,
				secondSizes,
				deltaSizes,
				deltaPercents: null,
				firstChunks: [],
				secondChunks: second.chunks,
			} );
		}
	}

	return sortByDelta( deltas );
}

// -- Markdown formatting --

function formatBytes( n ) {
	const abs = Math.abs( n );
	if ( abs >= 1000000 ) {
		return ( n / 1000000 ).toFixed( 2 ) + ' MB';
	}
	if ( abs >= 1000 ) {
		return ( n / 1000 ).toFixed( 2 ) + ' kB';
	}
	return n + ' B';
}

function formatSignedBytes( n ) {
	const sign = n > 0 ? '+' : '';
	return sign + formatBytes( n );
}

function formatPercent( d, sizeType ) {
	if ( ! d.firstSizes ) {
		return '_new_';
	}
	if ( ! d.secondSizes ) {
		return '_deleted_';
	}
	if ( d.deltaPercents && d.deltaPercents[ sizeType ] != null ) {
		const p = d.deltaPercents[ sizeType ];
		const sign = p >= 0 ? '+' : '';
		return sign + p.toFixed( 1 ) + '%';
	}
	return '';
}

function markdownTable( deltas ) {
	const lines = [];
	lines.push( '| Name | Parsed | | Gzip | |' );
	lines.push( '| :--- | ---: | ---: | ---: | ---: |' );

	for ( const d of deltas ) {
		const name = d.name.length > 60 ? d.name.slice( 0, 57 ) + '...' : d.name;
		const parsed = formatSignedBytes( d.deltaSizes.parsed_size );
		const parsedPct = formatPercent( d, 'parsed_size' );
		const gzip = formatSignedBytes( d.deltaSizes.gzip_size );
		const gzipPct = formatPercent( d, 'gzip_size' );
		lines.push( `| ${ name } | ${ parsed } | ${ parsedPct } | ${ gzip } | ${ gzipPct } |` );
	}

	return lines.join( '\n' );
}

// -- Build the comment --

const AREAS = [
	{
		id: 'runtime',
		title: 'Webpack Runtime',
		desc:
			'Webpack runtime for loading modules. It is included in the HTML page as an inline script. ' +
			'Is downloaded and parsed every time the app is loaded.',
	},
	{
		id: 'entry',
		title: 'App Entrypoints',
		desc: 'Common code that is always downloaded and parsed every time the app is loaded, no matter which route is used.',
	},
	{
		id: 'section',
		title: 'Sections',
		desc:
			'Sections contain code specific for a given set of routes. ' +
			'Is downloaded and parsed only when a particular route is navigated to.',
	},
	{
		id: 'async-load',
		title: 'Async-loaded Components',
		desc: 'React components that are loaded lazily, when a certain part of UI is displayed for the first time.',
	},
	{
		id: 'moment-locale',
		title: 'Moment.js Locales',
		desc: 'Locale data for moment.js. Unless you are upgrading the moment.js library, changes in these chunks are suspicious.',
	},
];

function areaOf( name ) {
	if ( name.startsWith( 'moment-locale-' ) ) {
		return 'moment-locale';
	}
	if ( name.startsWith( 'async-load-' ) ) {
		return 'async-load';
	}
	if ( name === 'entry' || name.startsWith( 'entry-' ) ) {
		return 'entry';
	}
	if ( name === 'runtime' ) {
		return 'runtime';
	}
	return 'section';
}

function groupByArea( deltas ) {
	const byArea = {};
	for ( const delta of deltas ) {
		const area = areaOf( delta.name );
		byArea[ area ] = byArea[ area ] || [];
		byArea[ area ].push( delta );
	}
	return byArea;
}

// Groups inside one area share chunks, so summing the group deltas would count the
// shared code many times. Sum the sizes of the distinct chunks in use instead.
function totalDeltaOfArea( areaDeltas, firstStats, secondStats ) {
	const [ firstSizes, secondSizes ] = [
		[ 'firstChunks', firstStats ],
		[ 'secondChunks', secondStats ],
	].map( ( [ chunksProp, stats ] ) => {
		const chunksInUse = new Set( areaDeltas.flatMap( ( delta ) => delta[ chunksProp ] ) );
		return [ ...chunksInUse ].reduce(
			( sizes, chunk ) =>
				sumSizesOf( sizes, sizesOf( stats.find( ( stat ) => stat.chunk === chunk ) ) ),
			ZERO_SIZE
		);
	} );

	return deltaSizesOf( firstSizes, secondSizes );
}

async function main() {
	const trunk = await loadBundle( trunkDir );
	const branch = await loadBundle( branchDir );

	const deltas = deltaFromGroups(
		trunk.chunkStats,
		trunk.chunkGroups,
		branch.chunkStats,
		branch.chunkGroups
	);
	const byArea = groupByArea( deltas );

	const message = [];

	if ( ! deltas.length ) {
		message.push(
			"This PR does not affect the size of JS and CSS bundles shipped to the user's browser."
		);
		return message;
	}

	message.push(
		"Here is how your PR affects size of JS and CSS bundles shipped to the user's browser:"
	);

	for ( const area of AREAS ) {
		const areaDeltas = byArea[ area.id ];
		if ( ! areaDeltas ) {
			continue;
		}

		const bytesDelta = totalDeltaOfArea(
			areaDeltas,
			trunk.chunkStats,
			branch.chunkStats
		).gzip_size;
		const suffix = bytesDelta < 0 ? 'removed 📉' : 'added 📈';

		message.push( '' );
		message.push(
			`**${ area.title }** (~${ Math.abs( bytesDelta ) } bytes ${ suffix } [gzipped])`
		);
		message.push( '<details>' );
		message.push( '' );
		message.push( markdownTable( areaDeltas ) );
		message.push( '' );
		message.push( area.desc );
		message.push( '</details>' );
	}

	message.push( '' );
	message.push( '**Legend**' );
	message.push( '<details>' );
	message.push( '<summary>What is parsed and gzip size?</summary>' );
	message.push( '' );
	message.push(
		'**Parsed Size:** Uncompressed size of the JS and CSS files. This much code needs to be parsed and stored in memory.'
	);
	message.push(
		'**Gzip Size:** Compressed size of the JS and CSS files. This much data needs to be downloaded over network.'
	);
	message.push( '</details>' );

	return message;
}

main().then(
	( output ) => process.stdout.write( output.join( '\n' ) ),
	( error ) => {
		console.error( `Compare: ${ error.message }` );
		process.exit( 1 );
	}
);
