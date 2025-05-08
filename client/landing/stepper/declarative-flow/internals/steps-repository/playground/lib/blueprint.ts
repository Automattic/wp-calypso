import { Blueprint } from '@wp-playground/blueprints';
import { resolveBlueprintFromURL } from './resolve-blueprint-from-url';

const BLUEPRINT_LIB_HOST = 'blueprintlibrary.wordpress.com';
const FALLBACK_PHP_VERSION = '8.3';
const DEFAULT_BLUEPRINT: Blueprint = {
	preferredVersions: {
		php: FALLBACK_PHP_VERSION,
		wp: 'latest',
	},
	features: {
		networking: true,
	},
	login: true,
};

const PREDEFINED_BLUEPRINTS: Record< string, Blueprint > = {
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

function getPHPVersion( recommendedPhpVersion: string ): string {
	if (
		recommendedPhpVersion !== undefined &&
		recommendedPhpVersion !== null &&
		recommendedPhpVersion !== ''
	) {
		return recommendedPhpVersion;
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
	const name = query.get( 'blueprint' );

	if ( name && name in PREDEFINED_BLUEPRINTS ) {
		return name;
	}

	// If it's a blueprintlibrary.wordpress.com url for blueprint, use it's id to construct the label
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

async function getBlueprintFromUrl( recommendedPhpVersion: string ): Blueprint {
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
		};
	}

	const blueprint = await resolveBlueprintFromURL( url );

	return {
		...DEFAULT_BLUEPRINT,
		...blueprint,
		steps: [ ...( DEFAULT_BLUEPRINT.steps || [] ), ...( blueprint.steps || [] ) ],
		preferredVersions: {
			wp: 'latest',
			php: getPHPVersion( recommendedPhpVersion ),
		},
	};
}

export async function getBlueprint(
	isWordPressInstalled: boolean,
	recommendedPhpVersion: string
): Promise< Blueprint > {
	return ! isWordPressInstalled
		? await getBlueprintFromUrl( recommendedPhpVersion )
		: getDefaultBlueprint( recommendedPhpVersion );
}
