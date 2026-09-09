#!/usr/bin/env node
/* Generate one vendored Calypso SCSS source from accepted served WPCOM assets. */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function createExtractor( { postcss, selectorParser } ) {
	const rootClasses = new Set( [
		'wpcom-global-nav-footer',
		'wpcom-global-nav-footer--2026',
		'wpcom-global-nav-footer--dark',
	] );
	const rootScope = '.wpcom-global-nav-footer';

	function variableNames( value ) {
		return [ ...value.matchAll( /var\(\s*(--[\w-]+)/g ) ].map( ( match ) => match[ 1 ] );
	}

	function selectorFacts( selector ) {
		const facts = { attributes: [], classes: [], hasId: false, nodes: [] };
		selectorParser( ( parsed ) => {
			const parsedSelector = parsed.nodes[ 0 ];
			facts.nodes = parsedSelector.nodes;
			parsed.walkClasses( ( node ) => facts.classes.push( node.value ) );
			parsed.walkAttributes( ( node ) => facts.attributes.push( node ) );
			parsed.walkIds( () => {
				facts.hasId = true;
			} );
		} ).processSync( selector );
		return facts;
	}

	function selectorDecision( selector, footerClasses ) {
		const facts = selectorFacts( selector );
		if ( facts.hasId ) {
			return { keep: false, reason: 'id-selector' };
		}
		if (
			facts.classes.length === 0 &&
			facts.nodes.some(
				( node ) =>
					( node.type === 'tag' && node.value === '_' ) ||
					( node.type === 'pseudo' &&
						( node.value.startsWith( '::-webkit-' ) || node.value === ':future' ) )
			)
		) {
			return { keep: false, reason: 'global-browser-hack' };
		}
		if (
			facts.classes.some(
				( className ) => ! footerClasses.has( className ) && ! rootClasses.has( className )
			)
		) {
			return { keep: false, reason: 'unknown-class' };
		}
		if ( facts.attributes.length ) {
			const allowed =
				facts.classes.length > 0 &&
				facts.attributes.every(
					( attribute ) =>
						( attribute.attribute === 'class' && [ '^=', '*=' ].includes( attribute.operator ) ) ||
						( attribute.attribute === 'open' && ! attribute.operator )
				);
			return {
				keep: allowed,
				reason: allowed ? 'known-class-state-attribute' : 'unsupported-attribute',
			};
		}
		return {
			keep: true,
			reason: facts.classes.length ? 'known-classes' : 'bare-element-or-universal',
		};
	}

	function keepSelector( selector, footerClasses ) {
		return selectorDecision( selector, footerClasses ).keep;
	}

	function isGlobalVariableSelector( selector ) {
		const facts = selectorFacts( selector );
		if ( facts.hasId || facts.nodes.some( ( node ) => node.type === 'combinator' ) ) {
			return false;
		}
		return facts.nodes.some(
			( node ) =>
				( node.type === 'pseudo' && node.value === ':root' ) ||
				( node.type === 'tag' && [ 'html', 'body' ].includes( node.value ) )
		);
	}

	function isGlobalVariableRule( rule ) {
		return rule.selectors?.every( isGlobalVariableSelector );
	}

	function scopeGlobalVariableSelector( selector ) {
		return selector.trim() === ':root' ? rootScope : `${ selector.trim() } ${ rootScope }`;
	}

	function animationNames( declaration ) {
		if ( ! [ 'animation', 'animation-name' ].includes( declaration.prop ) ) {
			return [];
		}
		return postcss.list.comma( declaration.value ).flatMap( ( animation ) => {
			const tokens = postcss.list.space( animation );
			if ( declaration.prop === 'animation-name' ) {
				return tokens.filter( ( token ) => /^[a-z_][\w-]*$/i.test( token ) && token !== 'none' );
			}
			return tokens.filter(
				( token ) =>
					/^[a-z_][\w-]*$/i.test( token ) &&
					! [
						'none',
						'linear',
						'ease',
						'ease-in',
						'ease-out',
						'ease-in-out',
						'infinite',
						'normal',
						'reverse',
						'alternate',
						'forwards',
						'backwards',
						'both',
						'running',
						'paused',
					].includes( token )
			);
		} );
	}

	function trailingPseudoElement( selector, facts ) {
		const last = facts.nodes.at( -1 );
		const legacyPseudoElements = new Set( [
			':after',
			':before',
			':first-letter',
			':first-line',
			':selection',
		] );
		if (
			last?.type !== 'pseudo' ||
			( ! last.value.startsWith( '::' ) && ! legacyPseudoElements.has( last.value ) )
		) {
			return { base: selector, pseudo: '' };
		}
		const pseudo = last.toString();
		return { base: selector.slice( 0, -pseudo.length ), pseudo };
	}

	function scopeSelector( sourceSelector ) {
		const facts = selectorFacts( sourceSelector );
		const firstCombinator = facts.nodes.findIndex( ( node ) => node.type === 'combinator' );
		const rootCompound = facts.nodes.slice(
			0,
			firstCombinator === -1 ? facts.nodes.length : firstCombinator
		);
		const rootCompoundClasses = rootCompound
			.filter( ( node ) => node.type === 'class' )
			.map( ( node ) => node.value );
		const hasFooterRoot = rootCompoundClasses.some( ( className ) => rootClasses.has( className ) );

		if ( hasFooterRoot ) {
			const modifiers = rootCompoundClasses.filter(
				( className ) => rootClasses.has( className ) && className !== 'wpcom-global-nav-footer'
			);
			const outer = `${ rootScope }${ modifiers
				.map( ( className ) => `.${ className }` )
				.join( '' ) }`;
			const sectionNodes = rootCompound.filter(
				( node ) => node.type !== 'class' || ! rootClasses.has( node.value )
			);
			const sectionCompound = sectionNodes.map( ( node ) => node.toString() ).join( '' );
			const remainder = facts.nodes
				.slice( rootCompound.length )
				.map( ( node ) => node.toString() )
				.join( '' );
			const rootHasSection = rootCompoundClasses.includes( 'lp-footer-section' );
			if ( rootHasSection || sectionCompound ) {
				return `${ outer } > ${
					rootHasSection ? sectionCompound : `.lp-footer-section${ sectionCompound }`
				}${ remainder }`;
			}
			if ( remainder.trimStart().startsWith( '>' ) ) {
				return `${ outer } > .lp-footer-section${ remainder }`;
			}
			return `${ outer }${ remainder }`;
		}

		const { base, pseudo } = trailingPseudoElement( sourceSelector.trim(), facts );
		return `${ rootScope } :is(${ base || '*' })${ pseudo }`;
	}

	function normalizedFontFace( atRule ) {
		const face = atRule.clone();
		face.walkDecls( ( declaration ) => {
			if ( declaration.prop === 'src' ) {
				declaration.value = declaration.value.replace(
					/url\((['"]?)(\/i\/fonts\/[^)'"\s]+)\1\)/g,
					'url(https://wordpress.com$2)'
				);
			}
		} );
		return face;
	}

	function extractCss( css, footerClasses, fontCss = css ) {
		const source = postcss.parse( css );
		const fontSource = postcss.parse( fontCss );
		const variablesNeeded = new Set();
		const keyframesNeeded = new Set();
		const globalRules = [];

		source.walkRules( ( rule ) => {
			if ( isGlobalVariableRule( rule ) ) {
				globalRules.push( rule );
				return;
			}
			for ( const selector of rule.selectors.filter( ( value ) =>
				keepSelector( value, footerClasses )
			) ) {
				void selector;
				rule.walkDecls( ( declaration ) => {
					variableNames( declaration.value ).forEach( ( name ) => variablesNeeded.add( name ) );
					animationNames( declaration ).forEach( ( name ) => keyframesNeeded.add( name ) );
				} );
				break;
			}
		} );

		let changed = true;
		while ( changed ) {
			changed = false;
			for ( const rule of globalRules ) {
				for ( const declaration of rule.nodes ?? [] ) {
					if ( declaration.type !== 'decl' || ! variablesNeeded.has( declaration.prop ) ) {
						continue;
					}
					for ( const name of variableNames( declaration.value ) ) {
						if ( ! variablesNeeded.has( name ) ) {
							variablesNeeded.add( name );
							changed = true;
						}
					}
				}
			}
		}

		function requiredFontFace( node ) {
			const family = node.nodes
				?.find( ( declaration ) => declaration.prop === 'font-family' )
				?.value?.replaceAll( /['"]/g, '' );
			const style =
				node.nodes?.find( ( declaration ) => declaration.prop === 'font-style' )?.value ?? 'normal';
			const weightValue =
				node.nodes?.find( ( declaration ) => declaration.prop === 'font-weight' )?.value ?? '';
			const weight = Number( weightValue );
			const isStaticFallback = family === 'inter-web' && [ 400, 500, 600, 700 ].includes( weight );
			const isVariableDefault =
				family === 'inter-variable-web' && /^100\s+900$/.test( weightValue );
			return style === 'normal' && ( isStaticFallback || isVariableDefault );
		}

		function copyChildren( parent, destination ) {
			for ( const node of parent.nodes ?? [] ) {
				if ( node.type === 'rule' ) {
					if ( isGlobalVariableRule( node ) ) {
						const declarations = node.nodes.filter(
							( declaration ) =>
								declaration.type === 'decl' && variablesNeeded.has( declaration.prop )
						);
						if ( declarations.length ) {
							const copy = node.clone( {
								nodes: declarations.map( ( declaration ) => declaration.clone() ),
							} );
							copy.selectors = node.selectors.map( scopeGlobalVariableSelector );
							destination.append( copy );
						}
						continue;
					}
					const selectors = node.selectors.filter( ( value ) =>
						keepSelector( value, footerClasses )
					);
					if ( selectors.length ) {
						const copy = node.clone();
						copy.selectors = selectors.map( scopeSelector );
						destination.append( copy );
					}
					continue;
				}
				if ( node.type === 'atrule' && node.name === 'font-face' ) {
					continue;
				}
				if ( node.type === 'atrule' && node.name.endsWith( 'keyframes' ) ) {
					if ( keyframesNeeded.has( node.params.trim() ) ) {
						destination.append( node.clone() );
					}
					continue;
				}
				if ( node.nodes ) {
					const wrapper = node.clone( { nodes: [] } );
					copyChildren( node, wrapper );
					if ( wrapper.nodes?.length ) {
						destination.append( wrapper );
					}
				}
			}
		}

		const output = postcss.root();
		fontSource.walkAtRules( 'font-face', ( face ) => {
			if ( requiredFontFace( face ) ) {
				output.append( normalizedFontFace( face ) );
			}
		} );
		copyChildren( source, output );
		return output.toString();
	}

	return {
		extractCss,
		isGlobalVariableRule,
		keepSelector,
		scopeGlobalVariableSelector,
		scopeSelector,
		selectorDecision,
	};
}

const usage = `Usage:
  node generate-footer-style.mjs \\
    --acceptance-manifest /absolute/accepted-footer-assets.json \\
    --css /absolute/served-footer.css \\
    --rtl-css /absolute/served-footer.rtl.css \\
    --font-css /absolute/served-general.css \\
    --legacy-html /absolute/footer-off.html \\
    --white-html /absolute/footer-white.html \\
    --dark-html /absolute/footer-dark.html \\
	    --calypso-html /absolute/calypso-footer-wrapper.html \\
	    --module-root /absolute/wp-calypso \\
	    --legacy-scss /absolute/legacy-pr1-style.scss \\
	    --legacy-commit fe0d18488f7a9d3ec0c548d5fb80267b6141f11d \\
	    --provenance-out /absolute/generation-provenance.json \\
	    --out /absolute/generated-style.scss`;

function fail( message ) {
	throw new Error( `${ message }\n\n${ usage }` );
}

function readArgs( values ) {
	if ( values.includes( '--help' ) || values.includes( '-h' ) ) {
		console.log( usage );
		process.exit( 0 );
	}
	const result = {};
	for ( let index = 0; index < values.length; index += 2 ) {
		const key = values[ index ];
		const value = values[ index + 1 ];
		if ( ! key?.startsWith( '--' ) || ! value || value.startsWith( '--' ) ) {
			fail( `Invalid argument ${ key ?? '' }.` );
		}
		result[ key.slice( 2 ) ] = value;
	}
	for ( const key of [
		'acceptance-manifest',
		'css',
		'rtl-css',
		'font-css',
		'legacy-html',
		'white-html',
		'dark-html',
		'calypso-html',
		'module-root',
		'legacy-scss',
		'legacy-commit',
		'provenance-out',
		'out',
	] ) {
		if ( ! result[ key ] ) {
			fail( `Missing --${ key }.` );
		}
	}
	return result;
}

export async function generateFooterStyle( argv = process.argv.slice( 2 ) ) {
	const args = readArgs( argv );
	const manifest = JSON.parse( await readFile( args[ 'acceptance-manifest' ], 'utf8' ) );
	if ( manifest.accepted !== true ) {
		fail( 'The acceptance manifest must contain "accepted": true.' );
	}

	const inputPaths = {
		css: args.css,
		rtlCss: args[ 'rtl-css' ],
		fontCss: args[ 'font-css' ],
		legacyHtml: args[ 'legacy-html' ],
		whiteHtml: args[ 'white-html' ],
		darkHtml: args[ 'dark-html' ],
		calypsoHtml: args[ 'calypso-html' ],
	};

	async function readAccepted( key, file ) {
		const contents = await readFile( file );
		const actual = createHash( 'sha256' ).update( contents ).digest( 'hex' );
		if ( manifest.inputs?.[ key ]?.sha256 !== actual ) {
			fail( `${ key } SHA-256 does not match the acceptance manifest.` );
		}
		return contents.toString();
	}

	const inputs = Object.fromEntries(
		await Promise.all(
			Object.entries( inputPaths ).map( async ( [ key, file ] ) => [
				key,
				await readAccepted( key, file ),
			] )
		)
	);

	function classesFrom( html ) {
		const classes = new Set();
		for ( const match of html.matchAll( /\bclass\s*=\s*(["'])(.*?)\1/gis ) ) {
			match[ 2 ]
				.trim()
				.split( /\s+/ )
				.forEach( ( className ) => classes.add( className ) );
		}
		return classes;
	}

	function requireClass( html, className, label ) {
		if ( ! classesFrom( html ).has( className ) ) {
			fail( `${ label } is missing .${ className }.` );
		}
	}

	requireClass( inputs.legacyHtml, 'wpcom-global-nav-footer', 'Legacy footer markup' );
	requireClass( inputs.legacyHtml, 'is-style-white-gray-mono', 'Legacy footer markup' );
	requireClass( inputs.whiteHtml, 'wpcom-global-nav-footer--2026', 'White footer markup' );
	requireClass( inputs.darkHtml, 'wpcom-global-nav-footer--2026', 'Dark footer markup' );
	requireClass( inputs.darkHtml, 'wpcom-global-nav-footer--dark', 'Dark footer markup' );
	if (
		! /class\s*=\s*(["'])[^"']*\bwpcom-global-nav-footer\b[^"']*\1/i.test( inputs.calypsoHtml ) ||
		! /<section\b[^>]*class\s*=\s*(["'])[^"']*\blp-footer-section\b[^"']*\1/i.test(
			inputs.calypsoHtml
		)
	) {
		fail(
			'Calypso markup must contain the outer footer wrapper and its section.lp-footer-section child.'
		);
	}

	const requireFromCalypso = createRequire( path.join( args[ 'module-root' ], 'package.json' ) );
	const postcss = requireFromCalypso( 'postcss' );
	const selectorParser = requireFromCalypso( 'postcss-selector-parser' );
	const extractor = createExtractor( {
		postcss,
		selectorParser,
	} );
	const footerClasses = new Set( [
		...classesFrom( inputs.legacyHtml ),
		...classesFrom( inputs.whiteHtml ),
		...classesFrom( inputs.darkHtml ),
	] );
	const banner =
		'/* DO NOT HAND-EDIT — generated from accepted served WPCOM assets. */\n';
	const legacyScss = await readFile( args[ 'legacy-scss' ], 'utf8' );
	const legacySha256 = createHash( 'sha256' ).update( legacyScss ).digest( 'hex' );
	if (
		args[ 'legacy-commit' ] !== 'fe0d18488f7a9d3ec0c548d5fb80267b6141f11d' ||
		legacySha256 !== '5c83ffd668cff7401af1e2925087fb94a41230baca8c8e0b73a4775da4474f15'
	) {
		fail( 'Legacy input must be the pinned PR1 style.scss blob and SHA-256.' );
	}

	function gateSelector( selector ) {
		return selectorParser( ( selectors ) =>
			selectors.each( ( parsed ) => {
				const root = parsed.nodes.slice(
					0,
					parsed.nodes.findIndex( ( node ) => node.type === 'combinator' ) === -1
						? parsed.nodes.length
						: parsed.nodes.findIndex( ( node ) => node.type === 'combinator' )
				);
				const outer = root.find(
					( node ) => node.type === 'class' && node.value === 'wpcom-global-nav-footer'
				);
				if ( ! outer ) {
					fail( `Extracted selector lacks Calypso root: ${ selector }` );
				}
				const containsPreviewMarker = ( node ) => {
					if ( node.type === 'class' ) {
						return node.value === 'wpcom-global-nav-footer--2026';
					}
					return node.nodes?.some( containsPreviewMarker ) ?? false;
				};
				if (
					root.some(
						( node ) =>
							node.type === 'pseudo' && node.value === ':not' && containsPreviewMarker( node )
					)
				) {
					fail( `Extracted selector negates the preview marker: ${ selector }` );
				}
				if (
					! root.some(
						( node ) => node.type === 'class' && node.value === 'wpcom-global-nav-footer--2026'
					)
				) {
					const gate = selectorParser.pseudo( { value: ':where' } );
					gate.append(
						selectorParser.selector( {
							nodes: [
								selectorParser.className( {
									value: 'wpcom-global-nav-footer--2026',
								} ),
							],
						} )
					);
					parsed.insertAfter( outer, gate );
				}
			} )
		).processSync( selector );
	}

	function previewOnly( css ) {
		const root = postcss.parse( css );
		root.walkAtRules( 'font-face', ( face ) => {
			const family = face.nodes
				?.find( ( node ) => node.type === 'decl' && node.prop === 'font-family' )
				?.value?.replaceAll( /['"]/g, '' );
			if ( family !== 'inter-variable-web' ) {
				face.remove();
			}
		} );
		root.walkRules( ( rule ) => {
			if ( rule.parent?.type !== 'atrule' || rule.parent.name !== 'font-face' ) {
				rule.selectors = rule.selectors.map( gateSelector );
			}
		} );
		return root.toString();
	}

	const preview = previewOnly( extractor.extractCss( inputs.css, footerClasses, inputs.fontCss ) );
	const output = `${ legacyScss }${
		legacyScss.endsWith( '\n' ) ? '' : '\n'
	}${ banner }${ preview }\n`;

	await writeFile( args.out, output );
	await writeFile(
		args[ 'provenance-out' ],
		`${ JSON.stringify(
			{
				mode: 'legacy-byte-preserving-positive-preview-append',
				legacy: { commit: args[ 'legacy-commit' ], sha256: legacySha256 },
				acceptedInputs: manifest.inputs,
				previewAppend: {
					sha256: createHash( 'sha256' ).update( preview ).digest( 'hex' ),
				},
				output: { sha256: createHash( 'sha256' ).update( output ).digest( 'hex' ) },
			},
			null,
			2
		) }\n`
	);
	console.log(
		`Generated ${ args.out } with byte-preserved legacy SCSS and positive-gated preview extraction.`
	);
	return { out: args.out, provenanceOut: args[ 'provenance-out' ] };
}

if ( process.argv[ 1 ] && import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	generateFooterStyle().catch( ( error ) => {
		console.error( error );
		process.exitCode = 1;
	} );
}
