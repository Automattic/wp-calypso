const fs = require( 'fs' );
const path = require('path');
const jscodeshift = require( 'jscodeshift' );
const camelCase = require( 'lodash/camelCase' );
const upperFirst = require( 'lodash/upperFirst' );

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


function isNodeClassOfReactComponent( node ) {
	const superClassNode = node.superClass;

	let isSubclassOfReactComponent = superClassNode.type === 'MemberExpression'
		&& superClassNode.object.name === 'React'
		&& superClassNode.property.name === 'Component';

	// superclass is just 'Component'
	isSubclassOfReactComponent = isSubclassOfReactComponent
		|| ( superClassNode.type === 'Identifier' && superClassNode.name === 'Component' );

	return isSubclassOfReactComponent;
}

function isNodeReactCreateClass( node ) {
	return node
		&& node.type === 'MemberExpression'
		&& node.object.name === 'React'
		&& node.property.name === 'createClass';
}

function isIdentifierReactComponent( astRoot, identifierName ) {
	let isReactCreateClass = false;
	let isSubclassOfReactComponent = false;
	let isFunction = false;

	// Identifier is intialized with React.createClass
	astRoot
		.findVariableDeclarators( identifierName )
		.forEach( path => {
			isReactCreateClass = path.value.init && isNodeReactCreateClass( path.value.init.callee );
		} );

	// Identifier is a class declaration
	astRoot
		.find( jscodeshift.ClassDeclaration )
		.filter( node => node.value.id.name === identifierName )
		.forEach( node => {
			isSubclassOfReactComponent = isNodeClassOfReactComponent( node.value )
		} );

	if ( astRoot.find( jscodeshift.FunctionDeclaration, { id: { name: identifierName } } ).size() > 0 ) {
		isFunction = true;
	}

	return isReactCreateClass || isSubclassOfReactComponent || isFunction;
}

const getFileNameFromPath = ( filePath ) => filePath.split( path.sep ).slice( -1 )[ 0 ];
const getFileNameWithoutExtensionFromPath = ( filePath ) => getFileNameFromPath( filePath ).split( '.' ).slice( 0, 1 )[ 0 ];

function createWithStylesCall( scssFilenames, withStylesTarget ) {
	return jscodeshift.callExpression(
		jscodeshift.callExpression(
			jscodeshift.identifier( 'withStyles' ),
			scssFilenames
				.map( getFileNameWithoutExtensionFromPath )
				.map( styleName => jscodeshift.identifier( styleName ) )
		),
		[ withStylesTarget ]
	);
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
 * 8. module.exports =
 *
 * @param filename
 * @param scssFilenames
 */
function addStylesToJsFile( filename, scssFilenames ) {
	const src = fs.readFileSync( filename ).toString( 'utf-8' );

	let modified = false;
	const root = jscodeshift( src );

	// before we start working, handle case [8] and transform "module.exports =" to "export default"
	// riped of from: https://github.com/Hacker0x01/coffee-to-es2015-codemod/blob/master/transforms/module-exports-to-export-default.js
	root
	.find( jscodeshift.ExpressionStatement, {
		expression: {
			type: 'AssignmentExpression',
			left: {
				type: 'MemberExpression',
				object: { name: 'module' },
				property: { name: 'exports' },
			},
		},
	} )
	.replaceWith( p => jscodeshift.exportDeclaration( true, p.node.expression.right ) );

	root
	.find( jscodeshift.ExportDefaultDeclaration )
	.forEach(function ( path ) {
		// do something with path
		//console.log( '>>> Type', path.value.declaration.type );

		// The export is an Identifier ( case [1] and [2] above ), lets find out what it is:
		if ( path.value.declaration.type === 'Identifier' ) {

			// Yay! The identifier is a react component
			if ( isIdentifierReactComponent( root, path.value.declaration.name ) ) {
				jscodeshift( path )
					.replaceWith(
						() => jscodeshift.exportDefaultDeclaration(
								createWithStylesCall( scssFilenames, jscodeshift.identifier( path.value.declaration.name ) )
							)
					);

				console.log( 'Identifier modified' );

				modified = true;
				return;
			}
		}

		// Exporting class Bla extends Component ( case [3] )
		if ( path.value.declaration.type === 'ClassDeclaration' && isNodeClassOfReactComponent( path.value.declaration ) ) {

			const replacedClassName = path.value.declaration.id.name;
			jscodeshift( path )
				.replaceWith(
					jscodeshift.classDeclaration(
						path.value.declaration.id,
						path.value.declaration.body,
						path.value.declaration.superClass
					)
				)
				.insertAfter( () => jscodeshift.exportDefaultDeclaration(
						createWithStylesCall( scssFilenames, jscodeshift.identifier( replacedClassName ) )
					)
				);

			console.log( 'ClassDecl modified' );

			modified = true;
			return;
		}

		// Exporting React.createClass ( case [4] )
		if ( path.value.declaration.type === 'CallExpression' && isNodeReactCreateClass( path.value.declaration.callee ) ) {
			const createClassVariableName = upperFirst( camelCase ( getFileNameWithoutExtensionFromPath( filename ) ) );

			jscodeshift( path )
				.replaceWith(
					jscodeshift.variableDeclaration( 'const', [
						jscodeshift.variableDeclarator(
							jscodeshift.identifier( createClassVariableName ),
							path.value.declaration
						) ]
					)
				)
				.insertAfter( () => jscodeshift.exportDefaultDeclaration(
						createWithStylesCall( scssFilenames, jscodeshift.identifier( createClassVariableName ) )
					)
				);

			console.log( 'React.createClass modified' );
			modified = true;
			return;
		}

		// case [5] and [6]
		if ( path.value.declaration.type === 'CallExpression' ) {
			// Loop down the call expression tree until we hit the final identifier
			let curNode = path.value.declaration;
			while ( curNode.type === 'CallExpression' ) {
				curNode = curNode.arguments[ 0 ];
			}

			// Is the thing we found is a React component ?
			if ( curNode.type === 'Identifier' && isIdentifierReactComponent( root, curNode.name ) ) {

				jscodeshift( path )
					.find( jscodeshift.Identifier, { name: curNode.name } )
					.replaceWith(
						createWithStylesCall( scssFilenames, jscodeshift.identifier( curNode.name ) )
					);

				console.log( 'Call expr modified' );
				modified = true;
				return;
			}
		}
	} );

	// we modified the export, now we can append imports:
	if ( modified ) {
		let lastImport = null;

		// find the last import
		root.find( jscodeshift.ImportDeclaration ).forEach( path => lastImport = path );

		// if haven't found imports, lets try require instead
		if ( ! lastImport ) {
			//root.find( jscodeshift.CallExpression ).forEach( p => console.log( p ) );
			root
				.find( jscodeshift.CallExpression, { callee: {name: 'require' } } )
				.closest( jscodeshift.VariableDeclaration)
				.forEach( path => lastImport = path );
		}

		const imports = jscodeshift( lastImport );

		//TODO: Verify those identifiers not already exists
		imports.insertAfter( () => jscodeshift.importDeclaration(
			[
				jscodeshift.importDefaultSpecifier(
					jscodeshift.identifier( 'withStyles' )
				)
			],
			jscodeshift.literal( 'isomorphic-style-loader/lib/withStyles' )
		) );

		// import style from './style.scss';
		scssFilenames.forEach( scssFile => imports.insertAfter( () =>
			jscodeshift.importDeclaration(
				[
					jscodeshift.importDefaultSpecifier(
						jscodeshift.identifier( getFileNameWithoutExtensionFromPath( scssFile ) )
					)
				],
				jscodeshift.literal( './' + getFileNameFromPath( scssFile ) )
			)
		) );
	}

	return modified ? root.toSource() : null;
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

			const indexJsFilename = indexJsFilenames[ 0 ];
			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/mailing-lists/main.jsx';
			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/components/accordion/index.jsx';
			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/blocks/daily-post-button/index.jsx';
			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/auth/auth-code-button.jsx';
			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/post-editor/editor-post-type/index.jsx';
			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/my-sites/themes/themes-magic-search-card/index.jsx';

			//const indexJsFilename = '/Users/yury/Automattic/wp-calypso/client/post-editor/editor-discussion/index.jsx';

			if ( scssFilesInDirectory.length > 0 ) {
				const result = addStylesToJsFile( indexJsFilename, scssFilesInDirectory );
				if ( result ) {
					processedDirectories++;
				}
				else {
					console.log( '[Unable]', indexJsFilename );
					skippedDirectories++;
				}
			}
		}

		console.log( 'Processed: ' + processedDirectories, 'Skipped: ' + skippedDirectories );
	}
);
