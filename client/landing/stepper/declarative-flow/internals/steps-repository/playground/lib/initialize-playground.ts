import config from '@automattic/calypso-config';
import { logToLogstash } from 'calypso/lib/logstash';
import { getBlueprint } from './blueprint';
import { PLAYGROUND_HOST } from './constants';
import type { Blueprint, BlueprintV1, MountDescriptor, PlaygroundClient } from './types';

const OPFS_PATH_PREFIX = '/wpcom-onboarding';

export async function initializeWordPressPlayground(
	iframe: HTMLIFrameElement,
	recommendedPhpVersion: string,
	setSearchParams: ( callback: ( prev: URLSearchParams ) => URLSearchParams ) => void,
	onPlaygroundClientLoaded?: () => void
): Promise< { blueprint: Blueprint | null; client: PlaygroundClient } > {
	let isWordPressInstalled = false;
	let needsUrlUpdate = false;

	const url = new URL( window.location.href );
	let playgroundId: string | null = url.searchParams.get( 'playground' );
	if ( ! playgroundId ) {
		// Create a new playground ID if none exists
		playgroundId = crypto.randomUUID();
		needsUrlUpdate = true;
	} else {
		// Assume we have WP installed, we will attempt to boot and capture the error when boot fails
		isWordPressInstalled = true;
	}

	try {
		const mountDescriptor: MountDescriptor = {
			device: {
				type: 'opfs',
				path: `${ OPFS_PATH_PREFIX }/${ playgroundId }/`,
			},
			mountpoint: '/wordpress',
			initialSyncDirection: isWordPressInstalled ? 'opfs-to-memfs' : 'memfs-to-opfs',
		};

		const blueprint = await getBlueprint( isWordPressInstalled, recommendedPhpVersion );
		const { startPlaygroundWeb } = await import(
			/* webpackIgnore: true */ PLAYGROUND_HOST + '/client/index.js'
		);
		onPlaygroundClientLoaded?.();
		const client = await startPlaygroundWeb( {
			iframe,
			remoteUrl: PLAYGROUND_HOST + '/remote.html',
			blueprint: blueprint as BlueprintV1,
			shouldInstallWordPress: ! isWordPressInstalled,
			mounts: isWordPressInstalled ? [ mountDescriptor ] : [],
		} );

		if ( ! isWordPressInstalled ) {
			await client.mountOpfs( mountDescriptor );
		}

		await client.isReady();

		if ( needsUrlUpdate ) {
			updateUrlWithPlaygroundId( playgroundId, url, setSearchParams );
		}

		return { blueprint, client };
	} catch ( error ) {
		if ( needsUrlUpdate ) {
			updateUrlWithPlaygroundId( playgroundId, url, setSearchParams );
		}

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

function updateUrlWithPlaygroundId(
	playgroundId: string,
	url: URL,
	setSearchParams: ( callback: ( prev: URLSearchParams ) => URLSearchParams ) => void
) {
	// update url in browser history
	url.searchParams.set( 'playground', playgroundId );
	window.history.replaceState( {}, '', url.toString() );
	// update search params through react router
	setSearchParams( ( prev ) => {
		prev.set( 'playground', playgroundId );
		return prev;
	} );
}
