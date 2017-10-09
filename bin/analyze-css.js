#!/usr/bin/env node

/**
 * External dependencies
 */
const execSync = require( 'child_process' ).execSync;
const fs = require( 'fs-extra' );
const glob = require( 'glob' );
const lodash = require( 'lodash' );
const padEnd = lodash.padEnd;
const padStart = lodash.padStart;
const path = require( 'path' );
const prettyBytes = require( 'pretty-bytes' );
const term = require( 'terminal-kit' ).terminal;

/**
 * Constants
 */
const PROJECT_DIRECTORY = path.resolve( __dirname, '..' );
const TEMP_DIRECTORY = path.resolve( PROJECT_DIRECTORY, 'temp' );
const DEBUG_BUNDLE = path.join( TEMP_DIRECTORY, 'assets', 'stylesheets', 'style.css' );
const NODE_SASS = path.join( PROJECT_DIRECTORY, 'node_modules', 'node-sass', 'bin', 'node-sass' );

/**
 * Analyzing Functions
 */
const extractRuleFromFragment = ( fragment ) => {
	const lines = fragment.split( '\n' );

	return lines.map( line => {
		// Gets rid of comments such as:
		//   /* [...] */
		//   -------------------------------------------------------------- */
		//   */
		return line.replace( /^[-\s]*\*\/|.*\/?\*.*\*\//, '' );
	} ).reduce( ( result, line ) => {
		const source = line.match( /(.*) \*\// );

		if ( source ) {
			if ( result.file ) {
				console.error( `Unable to parse line '${ line }'` );

				return result;
			}

			const [ , file ] = source;

			return Object.assign( {}, result, { file } );
		}

		const content = result.content + `\n${ line }`;

		return Object.assign( {}, result, { content: content.trim() } );
	}, { content: '' } );
};

const generateCSS = ( files, withComments = false ) => {
	files.forEach( file => {
		const input = path.join( PROJECT_DIRECTORY, 'assets', 'stylesheets', file );
		let output = path.join( TEMP_DIRECTORY, 'assets', 'stylesheets' );

		if ( ! file.includes( '.' ) ) {
			output = path.join( output, file );
		}

		const options = [
			'--include-path client',
			`--output ${ output }`,
			'--quiet'
		];

		if ( withComments ) {
			options.push( '--source-comments' );
		}

		execSync( `${ NODE_SASS } ${ options.join( ' ' ) } ${ input }` );
	} );
};

const normalizePath = ( file ) => {
	let newFile = file.replace( '.scss', '.css' );

	if ( path.isAbsolute( file ) ) {
		newFile = newFile.replace( PROJECT_DIRECTORY, '' );
	}

	return path.join( TEMP_DIRECTORY, newFile );
};

/**
 * Analyzing
 */
console.log( `> Cleaning up ${ TEMP_DIRECTORY } directory` );

fs.removeSync( TEMP_DIRECTORY );

console.log( '> Generating CSS from SASS' );

generateCSS( [
	'directly.scss',
	'editor.scss',
	'sections'
] );

generateCSS( [ 'style.scss' ], true );

console.log( '> Autoprefixing CSS' );

glob.sync( '**/*.css', { cwd: TEMP_DIRECTORY } ).forEach( file => {
	execSync( `npm run --silent autoprefixer -- ${ file }` );
} );

console.log( '> Opening CSS bundle' );

const bundle = fs.readFileSync( DEBUG_BUNDLE, 'utf8' );

console.log( '> Parsing CSS bundle' );

const fragments = bundle.split( /\/\* line \d+, /g ).slice( 1 );

const rules = fragments.reduce( ( result, fragment ) => {
	const rule = extractRuleFromFragment( fragment );

	const file = normalizePath( rule.file );

	let content = rule.content;

	if ( result.has( file ) ) {
		content = result.get( file ) + '\n\n' + content;
	}

	return result.set( file, content );
}, new Map() );

console.log( '> Generating CSS files' );

rules.forEach( ( content, file ) => {
	fs.ensureFileSync( file );
	fs.writeFileSync( file, content );
} );

/**
 * Rendering Functions
 */
const Folder = ( path, index = 0 ) => {
	return {
		path,
		items: getItems( path ),
		index
	};
};

const getDirectorySize = ( directory ) => {
	return fs.readdirSync( directory ).reduce( ( size, item ) => {
		return size + getItemSize( path.resolve( directory, item ) );
	}, 0 );
};

const getItemSize = ( item ) => {
	const stats = fs.statSync( item );

	if ( stats.isDirectory() ) {
		return getDirectorySize( item );
	}

	return stats.size;
};

const getItems = ( directory ) => {
	let maximumSize = 0;

	const items = fs.readdirSync( directory ).map( item => {
		const size = getItemSize( path.resolve( directory, item ) );

		maximumSize = Math.max( maximumSize, size );

		return {
			name: item,
			size
		};
	} ).sort( ( a, b ) => {
		return b.size - a.size;
	} );

	return items.map( item => {
		return Object.assign( {}, item, {
			percentage: Math.round( item.size / maximumSize * 100 )
		} );
	} );
};

const getMenu = ( folder, maximumNumberOfItems ) => {
	return folder.items.slice( 0, maximumNumberOfItems - 1 ).map( ( { name, percentage, size } ) => {
		const percentageBar = padEnd( '#'.repeat( Math.round( percentage / 10 ) ), 10 );

		return `${ padStart( prettyBytes( size ), 10 ) } [${ percentageBar }] /${ name }`;
	} );
};

const isProjectPath = ( directory ) => {
	const relativePath = path.relative( PROJECT_DIRECTORY, directory );

	return Boolean( relativePath ) && ! relativePath.startsWith( '..' ) && ! path.isAbsolute( relativePath );
};

const padLine = ( text, char = ' ' ) => {
	return `${ padEnd( text, term.width, char ) }\n`;
};

/**
 * Rendering
 */
let current = Folder( TEMP_DIRECTORY ), menu;

const render = () => {
	term.fullscreen();
	term.inverse( padLine( 'Use the arrow keys and BACKSPACE to navigate, ENTER to select, and ESC to quit' ) );
	term( '\n' );
	term.bold( padLine( `--- ${ current.path } `, '-' ) );

	if ( menu ) {
		menu.abort();
	}

	menu = term.singleColumnMenu(
		getMenu( current, term.height - 4 ),
		{ selectedIndex: current.index },
		( error, { selectedIndex } ) => {
			const selectedDirectory = current.items[ selectedIndex ].name;
			const selectedPath = path.resolve( current.path, selectedDirectory );
			const stats = fs.statSync( selectedPath );

			if ( stats.isDirectory() ) {
				current = Folder( selectedPath );
			} else {
				current.index = selectedIndex;

				term.bell();
			}

			render();
		} );
};

term.on( 'key', ( name ) => {
	switch ( name ) {
		case 'BACKSPACE':
			const parentPath = path.dirname( current.path );

			if ( isProjectPath( parentPath ) ) {
				current = Folder( parentPath );

				render();
			} else {
				term.bell();
			}

			break;

		case 'ESCAPE':
			term.clear();
			term.processExit();

			break;
	}
} );

render();
