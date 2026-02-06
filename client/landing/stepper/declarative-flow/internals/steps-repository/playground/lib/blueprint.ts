import { BLUEPRINT_LIB_HOST, FALLBACK_PHP_VERSION } from './constants';
import { ZipFilesystem, resolveRemoteBlueprint } from './resolve-remote-blueprint-standalone';
import type {
	Blueprint,
	BlueprintBundle,
	BlueprintV1Declaration,
	SupportedPHPVersion,
} from './types';

const DEFAULT_BLUEPRINT: BlueprintV1Declaration = {
	preferredVersions: {
		php: FALLBACK_PHP_VERSION,
		wp: 'latest',
	},
	features: {
		networking: true,
	},
	login: true,
};

const PREDEFINED_BLUEPRINTS: Record< string, BlueprintV1Declaration > = {
	woocommerce: {
		...DEFAULT_BLUEPRINT,
		landingPage: '/shop',
		steps: [
			{
				step: 'installPlugin',
				pluginData: {
					resource: 'wordpress.org/plugins',
					slug: 'woocommerce',
				},
				options: {
					activate: true,
				},
			},
			{
				step: 'importWxr',
				file: {
					resource: 'url',
					url: 'https://raw.githubusercontent.com/wordpress/blueprints/trunk/blueprints/woo-shipping/sample_products.xml',
				},
			},
		],
	},
	2024: {
		...DEFAULT_BLUEPRINT,
		steps: [
			{
				step: 'installTheme',
				themeData: {
					resource: 'wordpress.org/themes',
					slug: 'twentytwentyfour',
				},
				options: {
					activate: true,
				},
			},
		],
	},
	2023: {
		...DEFAULT_BLUEPRINT,
		steps: [
			{
				step: 'installTheme',
				themeData: {
					resource: 'wordpress.org/themes',
					slug: 'twentytwentythree',
				},
				options: {
					activate: true,
				},
			},
		],
	},
	design1: {
		...DEFAULT_BLUEPRINT,
		steps: [
			{
				step: 'installTheme',
				themeData: {
					resource: 'wordpress.org/themes',
					slug: 'variations',
				},
				options: {
					activate: true,
				},
			},
		],
	},
};

function getPHPVersion( recommendedPhpVersion: string ): SupportedPHPVersion {
	if (
		recommendedPhpVersion !== undefined &&
		recommendedPhpVersion !== null &&
		recommendedPhpVersion !== ''
	) {
		return recommendedPhpVersion as SupportedPHPVersion;
	}
	return FALLBACK_PHP_VERSION;
}

function getDefaultBlueprint( recommendedPhpVersion: string ): Blueprint {
	return {
		...DEFAULT_BLUEPRINT,
		preferredVersions: {
			wp: 'latest',
			php: getPHPVersion( recommendedPhpVersion ),
		},
	};
}

function getBlueprintName( name: string | null ): string | null {
	if ( name && name in PREDEFINED_BLUEPRINTS ) {
		return name;
	}

	return null;
}

// Used in sending the Tracks event
export function getBlueprintLabelForTracking( query: URLSearchParams ): string {
	const blueprint = query.get( 'blueprint' );

	if ( blueprint ) {
		if ( blueprint in PREDEFINED_BLUEPRINTS ) {
			return blueprint;
		}
		// blueprint library ID
		if ( ! isNaN( Number( blueprint ) ) ) {
			return 'bpl-' + blueprint;
		}
	}

	// If it's a blueprintlibrary.wordpress.com url for blueprint, use its id to construct the label
	const blueprintUrl = query.get( 'blueprint-url' );
	if ( blueprintUrl ) {
		const src = new URL( blueprintUrl );
		if ( src.host === BLUEPRINT_LIB_HOST ) {
			const id = src.searchParams.get( 'blueprint' );
			return 'bpl-' + id;
		}
	}

	return 'unknown';
}

async function getBlueprintFromUrl( recommendedPhpVersion: string ): Promise< Blueprint > {
	const url = new URL( window.location.href );
	const predefinedBlueprintName = getBlueprintName( url.searchParams.get( 'blueprint' ) );

	// If a predefined blueprint is specified and exists, use it
	if ( predefinedBlueprintName ) {
		const blueprint = PREDEFINED_BLUEPRINTS[ predefinedBlueprintName ];
		return {
			...blueprint,
			preferredVersions: {
				...blueprint.preferredVersions,
				php: getPHPVersion( recommendedPhpVersion ),
			},
		} as BlueprintV1Declaration;
	}

	const resolvedBlueprint = await resolveBlueprintFromURL( url );

	// ZIP bundles pass through unchanged
	if ( resolvedBlueprint instanceof ZipFilesystem ) {
		return resolvedBlueprint as BlueprintBundle;
	}

	// For JSON-based blueprints, extract the blueprint object for modification
	const blueprintFile = await resolvedBlueprint.read( '/blueprint.json' );
	const content = await blueprintFile.arrayBuffer();
	const blueprint: BlueprintV1Declaration = JSON.parse( new TextDecoder().decode( content ) );

	// Create a deeply merged blueprint where custom properties override defaults
	// but nested objects are merged properly
	// Some properties are always set to an ensured value, like login: true and networking: true
	// in the end, to ensure any new properties that might be added in the future are handled nicely
	return {
		...DEFAULT_BLUEPRINT,
		...blueprint,
		// Ensure steps are combined
		steps: [ ...( DEFAULT_BLUEPRINT.steps || [] ), ...( blueprint.steps || [] ) ].filter( Boolean ),
		// Ensure nested objects like preferredVersions are merged properly
		preferredVersions: {
			...DEFAULT_BLUEPRINT.preferredVersions,
			...blueprint.preferredVersions,
			php: getPHPVersion( recommendedPhpVersion ), // Always ensure PHP version is set correctly
			wp: 'latest', // Always ensure WordPress version is set to latest
		},
		// Ensure nested objects like features are merged properly
		features: {
			...DEFAULT_BLUEPRINT.features,
			...blueprint.features,
			networking: true, // ensure its always true
		},
		login: true, // ensure its always true, even though PG code already enforces this
	} as BlueprintV1Declaration;
}

export async function getBlueprint(
	isWordPressInstalled: boolean,
	recommendedPhpVersion: string
): Promise< Blueprint > {
	return ! isWordPressInstalled
		? await getBlueprintFromUrl( recommendedPhpVersion )
		: getDefaultBlueprint( recommendedPhpVersion );
}

async function resolveBlueprintFromURL( url: URL ): Promise< BlueprintBundle > {
	const q = url.searchParams;
	let source: string | null = null;
	let deprecationWarn = false;

	if ( q.has( 'blueprint-url' ) ) {
		source = q.get( 'blueprint-url' )!;
		deprecationWarn = true;
	} else if ( q.has( 'blueprint' ) ) {
		const id = Number( q.get( 'blueprint' ) );
		if ( ! isNaN( id ) ) {
			source = `https://${ BLUEPRINT_LIB_HOST }?blueprint=${ id }`;
		}
	}

	if ( ! source ) {
		throw new Error( 'No valid blueprint parameter found in URL' );
	}

	if ( deprecationWarn ) {
		// eslint-disable-next-line no-console
		console.warn(
			`Loading blueprint from ${ source } but please migrate to blueprint library (https://${ BLUEPRINT_LIB_HOST })`
		);
	}

	try {
		return await resolveRemoteBlueprint( source );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( error );
		throw new Error( `Failed to resolve blueprint: ${ source }` );
	}
}
