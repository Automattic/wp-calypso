const fs = require( 'fs' );
const path = require('path');
const jscodeshift = require( 'jscodeshift' );

const TRANSFORM_SOURCE_ROOT = path.resolve( 'client' );

// from: http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
function walk( dir, done ) {
	let results = [];

	fs.readdir( dir, ( err, list ) => {
		if ( err ) {
			return done( err );
		}

		let pending = list.length;

		if ( ! pending ) {
			return done( null, results );
		}

		list.forEach( ( file ) => {
			file = path.resolve( dir, file );
			fs.stat(file, ( err, stat ) => {
				if ( err ) {
					return done( err );
				}

				if ( stat && stat.isDirectory() ) {
					walk( file, ( err, res ) => {
						results = results.concat( res );
						if ( ! --pending ) done( null, results );
					} );
				} else {
					results.push( file );
					if ( ! --pending ) done( null, results );
				}
			} );
		} );
	} );
}


/****
 * We can have the following options:
 *
 * 1. Export a previously declared class:
 * class Accordion extends Component { ... }
 * export default Accordion;
 *
 * 2. Export a variable that was initialized with React.createClass:
 * const Accordion = React.createClass( { ... } );
 * export default Accordion;
 *
 * 3. Exported default class declaration:
 * export default class Accordion extends Component { ... }
 *
 * 4. Exported React.createClass expression:
 * export default React.createClass( { ... } );
 *
 * 5. Exported connect()
 *
 * 6. Exported localize()
 *
 * 7. Exported flow right?
 *
 * @param filename
 * @param scssFilenames
 */
function addStylesToJsFile( filename, scssFilenames ) {
	const src = fs.readFileSync( filename ).toString( 'utf-8' );

	console.log( filename );

	const root = jscodeshift( src );

	const output = root
		.find( jscodeshift.ExportDefaultDeclaration )
		.forEach(function ( path ) {
			// do something with path
			console.log( "!!!!!", path );
			console.log( path.value.declaration );

			// The export is an Identifier, lets find out what it is:
			if ( path.value.declaration.type === 'Identifier' ) {
				console.log( 'Export is an Identifier', path.value.declaration.name );

				let isReactCreateClass = false;
				let isSubclassOfReactComponent = false;

				// Identifier is intialized with React.createClass
				root
					.findVariableDeclarators( path.value.declaration.name )
					.forEach( path => {
						console.log( '~~~~>>> the init' );
						console.log( path.value.init );

						isReactCreateClass = path.value.init.callee.type === 'MemberExpression'
							&& path.value.init.callee.object.name === 'React'
							&& path.value.init.callee.property.name === 'createClass';
					} );

				// Identifier is a class declaration
				root
					.find( jscodeshift.ClassDeclaration )
					.filter( node => node.value.id.name === path.value.declaration.name )
					.forEach( node => {
						// superclass is 'React.Component'
						const superClassNode = node.value.superClass;
						isSubclassOfReactComponent = superClassNode.type === 'MemberExpression'
							&& superClassNode.object.name === 'React'
							&& superClassNode.property.name === 'Component';

						// superclass is just 'Component'
						isSubclassOfReactComponent = isSubclassOfReactComponent
							|| ( superClassNode.type === 'Identifier' && superClassNode.name === 'Component' );

						console.log( node.value, 'subclassssss', isSubclassOfReactComponent );
					} );

				// Yay! The identifier is a react component
				if ( isSubclassOfReactComponent || isReactCreateClass ) {
					jscodeshift( path )
						.replaceWith(
							node => jscodeshift.exportDefaultDeclaration(
								jscodeshift.callExpression(
									jscodeshift.identifier( 'withStyles' ),
									[ jscodeshift.identifier( path.value.declaration.name ) ]
								)
							)
						);
				}

			}
		} )
		.toSource();

	console.log( output );
}


// Find all the files from the TRANSFORM_SOURCE_ROOT
walk(
	TRANSFORM_SOURCE_ROOT,
	( err, results ) => {
		if (err) throw err;
		const directoryMap = new Map();

		// Create a map of directories with the files in each directory
		results.forEach( filename => {
			const dir = filename.split( path.sep ).slice( 0, -1 ).join( path.sep );
			if ( ! directoryMap.has( dir ) ) {
				directoryMap.set( dir, [] );
			}

			directoryMap.get( dir ).push( filename );
		} );


		let processedDirectories = 0;
		let skippedDirectories = 0;
		for ( let [ directory, filesInDirectory ] of directoryMap ) {
			const scssFilesInDirectory = filesInDirectory.filter( filename => filename.match( /\.scss$/ ) );

			if ( scssFilesInDirectory.length < 1 ) {
				continue;
			}

			const indexJsFilenames = filesInDirectory.filter( filename => filename.match( /index\.jsx?$/ ) );
			if ( indexJsFilenames.length !== 1 ) {
				console.error( 'Unable to find index javascript file in ' + directory );
				skippedDirectories++;
				continue;
			}

			//const indexJsFilename = indexJsFilenames[ 0 ];
			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/mailing-lists/main.jsx';
			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/components/accordion/index.jsx';
			const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/blocks/daily-post-button/index.jsx';
			addStylesToJsFile( indexJsFilename, scssFilesInDirectory );
			break;
			processedDirectories++;

			if ( scssFilesInDirectory.length > 0 ) {
				processedDirectories++;
			}


		}



		console.log( 'Processed: ' + processedDirectories, 'Skipped: ' + skippedDirectories );
	}
);
