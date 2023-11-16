import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import rtlcss from 'rtlcss';
import fs from 'node:fs/promises';
import path from 'node:path';

async function scanDirectories( basePath, extensions ) {
	return ( await fs.readdir( basePath, { withFileTypes: true } ) )
		.filter( ( dirent ) => dirent.isDirectory() )
		.map( ( dirent ) => dirent.name );
}

const rtlCSSPlugin = {
	name: 'RTLCSSPlugin',
	setup( build ) {
		build.onEnd( ( result ) => {
			Promise.all(
				Object.keys( result.metafile.outputs ).map( async ( file ) => {
					if ( /\.css$/.test( file ) ) {
						const cssContent = await fs.readFile( file, 'utf8' );
						const rtlContent = rtlcss.process( cssContent );
						await fs.writeFile( file.replace( /\.css$/, '.rtl.css' ), rtlContent );
					}
				} )
			);
		} );
	},
};

const copyFilesPlugin = ( filesToCopy ) => ( {
	name: 'CopyFilesPlugin',
	setup( build ) {
		build.onEnd( async ( result ) => {
			await Promise.all(
				filesToCopy.map( async ( { src, dest, transform } ) => {
					try {
						await fs.cp( src, dest, { force: true, recursive: true } );

						if ( transform ) {
							await fs.writeFile( dest, transform( await fs.readFile( dest, 'utf8' ) ) );
						}
					} catch ( error ) {}
				} )
			);
		} );
	},
} );

const blocks = await scanDirectories( './block-library' );

const result = blocks.map( async ( block ) => {
	const blockPath = path.resolve( process.cwd(), 'block-library', block );
	const entryPoints = ( await fs.readdir( blockPath ) )
		.filter( ( filepath ) => {
			return /(index|view)\.(j|t)sx?$/.test( filepath );
		} )
		.map( ( entryPoint ) => path.join( blockPath, entryPoint ) );

	if ( entryPoints.length === 0 ) {
		return;
	}

	const outdir = path.join( blockPath, 'build' );
	const define = {
		__i18n_text_domain__: JSON.stringify( 'happy-blocks' ),
		'process.env.FORCE_REDUCED_MOTION': JSON.stringify(
			!! process.env.FORCE_REDUCED_MOTION || false
		),
		global: 'window',
	};

	if ( process.env.NODE_ENV ) {
		define[ 'process.env.NODE_ENV' ] = JSON.stringify( process.env.NODE_ENV );
	}

	const result = await esbuild.build( {
		bundle: true,
		minify: true,
		metafile: true,
		entryPoints,
		outdir,
		loader: { '.svg': 'file', '.png': 'file', '.js': 'jsx' },
		mainFields: [ 'browser', 'calypso:src', 'module', 'main' ],
		define,
		plugins: [
			sassPlugin( {
				quietDeps: true,
			} ),
			rtlCSSPlugin,
			copyFilesPlugin( [
				{ src: path.join( blockPath, 'assets' ), dest: path.join( outdir, 'assets' ) },
				{
					src: path.join( blockPath, 'index.php' ),
					dest: path.join( outdir, 'index.php' ),
					transform( content ) {
						return content.toString().replaceAll( '/build/rtl', '/rtl' ).replaceAll( '/build', '' );
					},
				},
				{
					src: path.join( blockPath, 'includes.php' ),
					dest: path.join( outdir, 'includes.php' ),
					transform( content ) {
						return content.toString().replaceAll( '/build/rtl', '/rtl' ).replaceAll( '/build', '' );
					},
				},

				{ src: path.join( blockPath, 'block.json' ), dest: path.join( outdir, 'block.json' ) },
				{
					src: path.join( blockPath, 'rtl', 'block.json' ),
					dest: path.join( outdir, 'rtl', 'block.json' ),
				},
			] ),
		],
	} );

	await fs.writeFile(
		path.join( blockPath, 'build', 'meta.json' ),
		JSON.stringify( result.metafile )
	);
} );

await Promise.all( result );
