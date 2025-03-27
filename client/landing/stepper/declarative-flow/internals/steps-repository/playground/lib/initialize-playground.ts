import config from '@automattic/calypso-config';
import {
	type MountDescriptor,
	type PlaygroundClient,
	startPlaygroundWeb,
} from '@wp-playground/client';
import { logToLogstash } from 'calypso/lib/logstash';
import { getBlueprint } from './blueprint';

const OPFS_PATH_PREFIX = '/wpcom-onboarding';

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
			blueprint: await getBlueprint( isWordPressInstalled, recommendedPhpVersion ),
			shouldInstallWordPress: ! isWordPressInstalled,
			mounts: [ mountDescriptor ],
		} );

		window.history.replaceState( {}, '', window.location.pathname + window.location.search );

		await client.isReady();
		return client;
	} catch ( error ) {
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
