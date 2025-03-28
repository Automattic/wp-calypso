import { Blueprint } from '@wp-playground/blueprints';
import { resolveBlueprintFromURL } from './resolve-blueprint-from-url';

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

async function getBlueprintFromUrl( recommendedPhpVersion: string ): Blueprint {
	const url = new URL( window.location.href );
	const predefinedBlueprintName = url.searchParams.get( 'blueprint' );

	// If a predefined blueprint is specified and exists, use it
	if ( predefinedBlueprintName && predefinedBlueprintName in PREDEFINED_BLUEPRINTS ) {
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
