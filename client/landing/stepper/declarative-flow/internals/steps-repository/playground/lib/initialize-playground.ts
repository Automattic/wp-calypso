import config from '@automattic/calypso-config';
import { Blueprint } from '@wp-playground/blueprints';
import { MountDescriptor, PlaygroundClient, startPlaygroundWeb } from '@wp-playground/client';
import { logToLogstash } from 'calypso/lib/logstash';

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

export async function initializeWordPressPlayground(
	iframe: HTMLIFrameElement
): Promise< PlaygroundClient > {
	let isWordPressInstalled = false;

	const url = new URL( window.location.href );
	let playgroundId = url.searchParams.get( 'playground' );
	if ( ! playgroundId ) {
		playgroundId = Math.floor( Math.random() * 1000000 ).toString();
		url.searchParams.set( 'playground', playgroundId );
		window.history.replaceState( {}, '', url.toString() );
	} else {
		// TODO: check if WordPress is installed using playgroundAvailableInOpfs from @wp-playground/website
		isWordPressInstalled = true;
	}

	try {
		// get blueprint json from the hash
		let blueprint: Blueprint | null = null;
		try {
			blueprint = JSON.parse( decodeURIComponent( window.location.hash.slice( 1 ) ) );
			blueprint = {
				...DEFAULT_BLUEPRINT,
				...blueprint,
			};
			blueprint.steps = [ ...( DEFAULT_BLUEPRINT.steps || [] ), ...( blueprint.steps || [] ) ];
		} catch ( error ) {
			// If the blueprint is invalid, use the default one
			blueprint = DEFAULT_BLUEPRINT;
		}

		const mountDescriptor: MountDescriptor = {
			device: {
				type: 'opfs',
				path: `/sites/${ playgroundId }/`,
			},
			mountpoint: '/wordpress',
			initialSyncDirection: 'opfs-to-memfs',
		};

		const client = await startPlaygroundWeb( {
			iframe,
			remoteUrl: 'https://playground.wordpress.net/remote.html',
			blueprint,
			onClientConnected: ( playground: PlaygroundClient ) => {
				// TODO remove for production
				( window as any )[ 'playground' ] = playground;
			},
			shouldInstallWordPress: ! isWordPressInstalled,
			mounts: [ mountDescriptor ],
		} );

		window.history.replaceState( {}, '', window.location.pathname + window.location.search );

		await client.isReady();
		return await client;
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
