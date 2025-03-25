import config from '@automattic/calypso-config';
import { Blueprint } from '@wp-playground/blueprints';
import { MountDescriptor, PlaygroundClient, startPlaygroundWeb } from '@wp-playground/client';
import { logToLogstash } from 'calypso/lib/logstash';
import { resolveBlueprintFromURL } from './resolve-blueprint-from-url';

const OPFS_PATH_PREFIX = '/wpcom-onboarding';
const DEFAULT_BLUEPRINT: Blueprint = {
	preferredVersions: {
		php: '8.3', // always overwritten, when blueprints constants are not used directly
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
	// Add more predefined blueprints here as needed
};

async function getBlueprintFromUrl( recommendedPhpVersion: string ): Blueprint {
	const url = new URL( window.location.href );
	const predefinedBlueprintName = url.searchParams.get( 'blueprint' );

	// If a predefined blueprint is specified and exists, use it
	if ( predefinedBlueprintName && predefinedBlueprintName in PREDEFINED_BLUEPRINTS ) {
		return PREDEFINED_BLUEPRINTS[ predefinedBlueprintName ];
	}

	const blueprint = await resolveBlueprintFromURL( url );

	return {
		...DEFAULT_BLUEPRINT,
		...blueprint,
		steps: [ ...( DEFAULT_BLUEPRINT.steps || [] ), ...( blueprint.steps || [] ) ],
		preferredVersions: {
			wp: 'latest',
			php: recommendedPhpVersion,
		},
	};
}

function getDefaultBlueprint( recommendedPhpVersion: string ): Blueprint {
	return {
		...DEFAULT_BLUEPRINT,
		preferredVersions: {
			wp: 'latest',
			php: recommendedPhpVersion,
		},
	};
}

async function getBlueprintForBoot(
	isWordPressInstalled: boolean,
	recommendedPhpVersion: string
): Blueprint {
	return ! isWordPressInstalled
		? await getBlueprintFromUrl( recommendedPhpVersion )
		: getDefaultBlueprint( recommendedPhpVersion );
}

export async function initializeWordPressPlayground(
	iframe: HTMLIFrameElement,
	recommendedPhpVersion: string
): Promise< PlaygroundClient > {
	let isWordPressInstalled = false;

	const url = new URL( window.location.href );
	let playgroundId = url.searchParams.get( 'playground' );
	if ( ! playgroundId ) {
		playgroundId = crypto.randomUUID();
		url.searchParams.set( 'playground', playgroundId );
		window.history.replaceState( {}, '', url.toString() );
	} else {
		// TODO: check if WordPress is installed using playgroundAvailableInOpfs from @wp-playground/website
		isWordPressInstalled = true;
	}

	try {
		const mountDescriptor: MountDescriptor = {
			device: {
				type: 'opfs',
				path: `${ OPFS_PATH_PREFIX }/${ playgroundId }/`,
			},
			mountpoint: '/wordpress',
			initialSyncDirection: 'opfs-to-memfs',
		};

		const client = await startPlaygroundWeb( {
			iframe,
			remoteUrl: 'https://playground.wordpress.net/remote.html',
			blueprint: getBlueprintForBoot( isWordPressInstalled, recommendedPhpVersion ),
			shouldInstallWordPress: ! isWordPressInstalled,
			mounts: [ mountDescriptor ],
		} );

		window.history.replaceState( {}, '', window.location.pathname + window.location.search );

		await client.isReady();
		return client;
	} catch ( error ) {
		// console.error( 'Error initializing WordPress Playground:', error );
		logToLogstash( {
			feature: 'calypso_client',
			tags: [ 'playground-setup' ],
			message: ( error as Error ).message,
			site_id: undefined,
			properties: {
				env: config( 'env_id' ),
			},
		} );
		throw error;
	}
}
