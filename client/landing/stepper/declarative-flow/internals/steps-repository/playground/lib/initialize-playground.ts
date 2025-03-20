import config from '@automattic/calypso-config';
import { Blueprint } from '@wp-playground/blueprints';
import { MountDescriptor, PlaygroundClient, startPlaygroundWeb } from '@wp-playground/client';
import { logToLogstash } from 'calypso/lib/logstash';

const OPFS_PATH_PREFIX = '/wpcom-onboarding';
const DEFAULT_BLUEPRINT: Blueprint = {
	preferredVersions: {
		php: '8.3',
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
		],
	},
	// Add more predefined blueprints here as needed
};

function getBlueprintFromUrl(): Blueprint {
	const url = new URL( window.location.href );
	const predefinedBlueprintName = url.searchParams.get( 'blueprint' );

	// If a predefined blueprint is specified and exists, use it
	if ( predefinedBlueprintName && predefinedBlueprintName in PREDEFINED_BLUEPRINTS ) {
		return PREDEFINED_BLUEPRINTS[ predefinedBlueprintName ];
	}

	// Otherwise, try to get blueprint from hash
	try {
		const blueprint = JSON.parse( decodeURIComponent( window.location.hash.slice( 1 ) ) );
		return {
			...DEFAULT_BLUEPRINT,
			...blueprint,
			steps: [ ...( DEFAULT_BLUEPRINT.steps || [] ), ...( blueprint.steps || [] ) ],
		};
	} catch ( error ) {
		// If the blueprint is invalid or missing, use the default one
		return DEFAULT_BLUEPRINT;
	}
}

export async function initializeWordPressPlayground(
	iframe: HTMLIFrameElement
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
			blueprint: ! isWordPressInstalled ? getBlueprintFromUrl() : DEFAULT_BLUEPRINT,
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
