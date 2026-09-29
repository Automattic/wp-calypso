#!/usr/bin/env node
/** Export the live resource SVG/CSS artwork without starting or touching the app.
 * Usage: node bin/export-resource-illustrations.cjs [output-directory]
 * Requires existing project dependencies, Playwright Chromium, and ffmpeg on PATH.
 */
const fs = require( 'node:fs/promises' );
const path = require( 'node:path' );
const os = require( 'node:os' );
const { execFileSync } = require( 'node:child_process' );
const { build } = require( 'esbuild' );
const sass = require( 'sass' );
const { chromium } = require( 'playwright' );

const root = path.resolve( __dirname, '..' );
const source = path.join( root, 'client/dashboard/agency/resources/learn' );
const output = path.resolve(
	process.argv[ 2 ] || path.join( os.homedir(), 'Desktop/Library illustrations' )
);
const types = [
	'One-pager',
	'Guide',
	'Talk track',
	'Video',
	'Case study',
	'Slide deck',
	'Checklist',
];
const size = 640;
const fps = 25;

async function main() {
	execFileSync( 'ffmpeg', [ '-version' ], { stdio: 'ignore' } );
	await fs.mkdir( output, { recursive: true } );
	const temp = await fs.mkdtemp( path.join( os.tmpdir(), 'resource-illustrations-' ) );
	let browser;
	try {
		const bundle = await build( {
			stdin: {
				contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import Illustration from './resource-thumbnail'; export default type => renderToStaticMarkup(React.createElement(Illustration, {contentType:type}));`,
				resolveDir: source,
				loader: 'tsx',
			},
			bundle: true,
			platform: 'node',
			format: 'cjs',
			jsx: 'automatic',
			write: false,
		} );
		const module = { exports: {} };
		new Function( 'module', 'exports', 'require', bundle.outputFiles[ 0 ].text )(
			module,
			module.exports,
			require
		);
		const render = module.exports.default;
		const css = sass.compile( path.join( source, 'sample-resource-grid.scss' ), {
			loadPaths: [ path.join( root, 'node_modules' ) ],
			logger: sass.Logger.silent,
		} ).css;
		browser = await chromium.launch( { headless: true } );
		const page = await browser.newPage( {
			viewport: { width: size, height: size },
			deviceScaleFactor: 1,
			reducedMotion: 'no-preference',
		} );
		const items = [];
		for ( const type of types ) {
			const name = type.toLowerCase().replaceAll( ' ', '-' );
			await page.setContent(
				`<style>${ css }\nhtml,body{margin:0;width:100%;height:100%;background:#fff;color:#222;overflow:hidden}.resource-illustration-review{margin:0;width:100%;height:100%;display:grid;place-items:center}.resource-illustration-review>.resource-thumbnail{width:560px;height:560px;display:block}</style><div class="resource-illustration-review">${ render(
					type
				) }</div>`
			);
			const duration = await page.evaluate( () => {
				const animations = document.getAnimations();
				if ( ! animations.length ) throw new Error( 'No illustration animations found' );
				for ( const animation of animations ) {
					animation.pause();
					animation.currentTime = 0;
				}
				return Math.max(
					...animations.map( ( animation ) => Number( animation.effect.getTiming().duration ) )
				);
			} );
			const frames = Math.round( ( duration / 1000 ) * fps );
			const frameDir = path.join( temp, name );
			await fs.mkdir( frameDir );
			console.log( `Rendering ${ type }: ${ frames } frames, ${ duration / 1000 }s` );
			for ( let frame = 0; frame < frames; frame++ ) {
				await page.evaluate(
					( time ) => {
						for ( const animation of document.getAnimations() ) animation.currentTime = time;
					},
					( frame * 1000 ) / fps
				);
				await page.screenshot( {
					path: path.join( frameDir, `${ String( frame ).padStart( 4, '0' ) }.png` ),
					animations: 'allow',
				} );
			}
			const input = [
				'-hide_banner',
				'-loglevel',
				'error',
				'-y',
				'-framerate',
				String( fps ),
				'-i',
				path.join( frameDir, '%04d.png' ),
			];
			execFileSync( 'ffmpeg', [
				...input,
				'-filter_complex',
				'[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a',
				'-loop',
				'0',
				path.join( output, `${ name }.gif` ),
			] );
			execFileSync( 'ffmpeg', [
				...input,
				'-c:v',
				'libx264',
				'-crf',
				'15',
				'-pix_fmt',
				'yuv420p',
				'-movflags',
				'+faststart',
				path.join( output, `${ name }.mp4` ),
			] );
			items.push(
				`<figure><img src="${ name }.gif" width="320" height="320"><figcaption>${ type }</figcaption></figure>`
			);
		}
		await fs.writeFile(
			path.join( output, 'preview.html' ),
			`<!doctype html><meta charset="utf-8"><title>Library illustrations</title><style>body{font:16px system-ui;margin:32px;color:#222}main{display:flex;flex-wrap:wrap;gap:24px}figure{margin:0}figcaption{text-align:center}</style><h1>Library illustrations</h1><main>${ items.join(
				''
			) }</main>`
		);
		await fs.writeFile(
			path.join( output, 'README.txt' ),
			`Library illustrations — 640 × 640, 25 fps, white background.\n\nGIFs loop forever and are ready to upload as images. MP4s preserve the gradients better, but looping depends on the player (enable loop in your embed).\nResource and One-pager share the one-pager illustration; Webinar shares Video.\nOpen preview.html to see all seven GIFs together.\n\nRegenerate from the current artwork:\ncd ${ root }\nnode bin/export-resource-illustrations.cjs\n`
		);
		console.log( `Saved exports to ${ output }` );
	} finally {
		if ( browser ) await browser.close();
		await fs.rm( temp, { recursive: true, force: true } );
	}
}
main().catch( ( error ) => {
	console.error( error );
	process.exitCode = 1;
} );
