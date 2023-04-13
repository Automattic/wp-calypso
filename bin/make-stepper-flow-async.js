const { readFileSync, writeFileSync, readdirSync } = require( 'fs' );
const { resolve } = require( 'path' );
const chalk = require( 'chalk' );
const prettier = require( 'prettier' );

convertFlow();

function convertFlow() {
	const passedFlowName = process.argv[ 2 ];
	const flowsDir = resolve( __dirname, '../client/landing/stepper/declarative-flow' );
	const availableFlows = readdirSync( flowsDir ).filter( ( filename ) => {
		return (
			filename.endsWith( '.ts' ) &&
			readFileSync( resolve( flowsDir, filename ) ).toString().includes( 'useStepNavigation' )
		);
	} );

	if ( ! availableFlows.find( ( flow ) => flow === passedFlowName + '.ts' ) ) {
		console.error( chalk.red( 'Flow does not exist.' ) );
		console.error( chalk.cyan( `Available options are:\n${ availableFlows.join( '\n' ) }` ) );
		process.exit( 1 );
	}

	const filename = resolve( flowsDir, passedFlowName + '.ts' );

	const prettierOptions = prettier.resolveConfig.sync( resolve( __dirname, '../.prettierrc' ) );

	const contents = readFileSync( filename );

	const stepsImported = contents
		.toString()
		.matchAll( /import ([A-Z].*?) from ('.\/internals\/steps-repository\/.*?');\n?/g );

	const stepsMap = {};
	const stepsImports = [];

	Array.from( stepsImported ).forEach( ( match ) => {
		stepsMap[ match[ 1 ] ] = match[ 2 ];
		stepsImports.push( match[ 0 ] );
	}, {} );

	const results = stepsImports.reduce( ( result, stepImport ) => {
		return result.replace( stepImport, '' );
	}, contents.toString() );

	const finalResult = results.replace(
		/slug: '(.*?)',.*?component: (.*?) \}/gm,
		( match, slug, component ) => {
			return `slug: '${ slug }', asyncComponent: () => import( ${ stepsMap[ component ] } ) }`;
		}
	);

	writeFileSync(
		filename,
		prettier.format( finalResult, { ...prettierOptions, parser: 'typescript' } )
	);
	console.log( `Processed ${ filename }` );
}
