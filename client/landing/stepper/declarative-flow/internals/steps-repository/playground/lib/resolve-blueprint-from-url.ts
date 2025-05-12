import { Blueprint, StepDefinition } from '@wp-playground/client';

/**
 * All code in this file is copied from @wp-playground/website package
 *
 * TODO: Once this function is moved to a package that's supposed to be published,
 * we can switch to using that and delete this file here.
 */

export function decodeBase64ToUint8Array( base64: string ) {
	const binaryString = window.atob( base64 ); // This will convert base64 to binary string
	const len = binaryString.length;
	const bytes = new Uint8Array( len );
	for ( let i = 0; i < len; i++ ) {
		bytes[ i ] = binaryString.charCodeAt( i );
	}
	return bytes;
}
export function decodeBase64ToString( base64: string ) {
	return new TextDecoder().decode( decodeBase64ToUint8Array( base64 ) );
}

export function parseBlueprint( rawData: string ): Blueprint {
	try {
		try {
			return JSON.parse( rawData );
		} catch ( e ) {
			return JSON.parse( decodeBase64ToString( rawData ) );
		}
	} catch ( e ) {
		throw new Error( 'Invalid blueprint' );
	}
}

export async function resolveBlueprintFromURL( url: URL ) {
	const query = url.searchParams;
	const fragment = decodeURI( url.hash || '#' ).substring( 1 );

	let blueprint: Blueprint;
	/*
	 * Support passing blueprints via query parameter, e.g.:
	 * ?blueprint-url=https://example.com/blueprint.json
	 */
	if ( query.has( 'blueprint-url' ) ) {
		const url = query.get( 'blueprint-url' );
		const response = await fetch( url!, {
			credentials: 'omit',
		} );
		blueprint = ( await response.json() ) as Blueprint;
	} else if ( fragment.length ) {
		/*
		 * Support passing blueprints in the URI fragment, e.g.:
		 * /#{"landingPage": "/?p=4"}
		 */
		blueprint = parseBlueprint( fragment );
	} else {
		const importWxrQueryArg = query.get( 'import-wxr' ) || query.get( 'import-content' );

		// This Blueprint is intentionally missing most query args (like login).
		// They are added below to ensure they're also applied to Blueprints passed
		// via the hash fragment (#{...}) or via the `blueprint-url` query param.
		blueprint = {
			plugins: query.getAll( 'plugin' ),
			steps: [
				importWxrQueryArg &&
					/^(http(s?)):\/\//i.test( importWxrQueryArg ) && {
						step: 'importWxr',
						file: {
							resource: 'url',
							url: importWxrQueryArg,
						},
					},
				query.get( 'import-site' ) &&
					/^(http(s?)):\/\//i.test( query.get( 'import-site' )! ) && {
						step: 'importWordPressFiles',
						wordPressFilesZip: {
							resource: 'url',
							url: query.get( 'import-site' )!,
						},
					},
				query.get( 'theme' ) && {
					step: 'installTheme',
					themeData: {
						resource: 'wordpress.org/themes',
						slug: query.get( 'theme' )!,
					},
					progress: { weight: 2 },
				},
			],
		} satisfies Blueprint;
	}

	/**
	 * Allow overriding PHP and WordPress versions defined in a Blueprint
	 * via query params.
	 */

	// PHP and WordPress versions
	if ( ! blueprint.preferredVersions ) {
		blueprint.preferredVersions = {};
	}

	blueprint.preferredVersions!.php =
		query.get( 'php' ) || blueprint.preferredVersions!.php || '8.0';
	blueprint.preferredVersions!.wp =
		query.get( 'wp' ) || blueprint.preferredVersions!.wp || 'latest';

	// Features
	if ( ! blueprint.features ) {
		blueprint.features = {};
	}

	/**
	 * Networking is disabled by default, so we only need to enable it
	 * if the query param is explicitly set to "yes".
	 */
	if ( query.get( 'networking' ) === 'yes' ) {
		blueprint.features[ 'networking' ] = true;
	}

	// Language
	if ( query.get( 'language' ) ) {
		if (
			! blueprint?.steps?.find(
				( step: StepDefinition ) => step && step.step === 'setSiteLanguage'
			)
		) {
			blueprint.steps?.push( {
				step: 'setSiteLanguage',
				language: query.get( 'language' )!,
			} );
		}
	}

	// Multisite
	if ( query.get( 'multisite' ) === 'yes' ) {
		if (
			! blueprint?.steps?.find(
				( step: StepDefinition ) => step && step.step === 'enableMultisite'
			)
		) {
			blueprint.steps?.push( {
				step: 'enableMultisite',
			} );
		}
	}

	// Login
	if ( query.get( 'login' ) !== 'no' ) {
		blueprint.login = true;
	}

	// Landing page
	if ( query.get( 'url' ) ) {
		blueprint.landingPage = query.get( 'url' )!;
	}

	/*
	 * The 6.3 release includes a caching bug where
	 * registered styles aren't enqueued when they
	 * should be. This isn't present in all environments
	 * but it does here in the Playground. For now,
	 * the fix is to define `WP_DEVELOPMENT_MODE = all`
	 * to bypass the style cache.
	 *
	 * @see https://core.trac.wordpress.org/ticket/59056
	 */
	if ( blueprint.preferredVersions?.wp === '6.3' ) {
		blueprint.steps?.unshift( {
			step: 'defineWpConfigConsts',
			consts: {
				WP_DEVELOPMENT_MODE: 'all',
			},
		} );
	}

	if ( query.has( 'core-pr' ) ) {
		const prNumber = query.get( 'core-pr' );
		blueprint.preferredVersions!.wp = `https://wordpress-playground.atomicsites.blog/plugin-proxy.php?org=WordPress&repo=wordpress-develop&workflow=Test%20Build%20Processes&artifact=wordpress-build-${ prNumber }&pr=${ prNumber }`;
	}

	if ( query.has( 'gutenberg-pr' ) ) {
		const prNumber = query.get( 'gutenberg-pr' );
		blueprint.steps = blueprint.steps || [];
		blueprint.steps.unshift(
			{
				step: 'mkdir',
				path: '/tmp/pr',
			},
			{
				step: 'writeFile',
				path: '/tmp/pr/pr.zip',
				data: {
					resource: 'url',
					url: `/plugin-proxy.php?org=WordPress&repo=gutenberg&workflow=Build%20Gutenberg%20Plugin%20Zip&artifact=gutenberg-plugin&pr=${ prNumber }`,
					caption: `Downloading Gutenberg PR ${ prNumber }`,
				},
			},
			/**
			 * GitHub CI artifacts are doubly zipped:
			 *
			 * pr.zip
			 *    gutenberg.zip
			 *       gutenberg.php
			 *       ... other files ...
			 *
			 * This step extracts the inner zip file so that we get
			 * access directly to gutenberg.zip and can use it to
			 * install the plugin.
			 */
			{
				step: 'unzip',
				zipPath: '/tmp/pr/pr.zip',
				extractToPath: '/tmp/pr',
			},
			{
				step: 'installPlugin',
				pluginData: {
					resource: 'vfs',
					path: '/tmp/pr/gutenberg.zip',
				},
			}
		);
	}

	return blueprint;
}
