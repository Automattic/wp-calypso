import config from '@automattic/calypso-config';
import {
	type MountDescriptor,
	type PlaygroundClient,
	startPlaygroundWeb,
} from '@wp-playground/client';
import { logToLogstash } from 'calypso/lib/logstash';
import { getBlueprint } from './blueprint';

const OPFS_PATH_PREFIX = '/wpcom-onboarding';
export const LOCAL_STORAGE_KEY_FOR_PG_ID = 'pg_flow_pg_id';
export const LOCAL_STORAGE_KEY_FOR_PG_ID_TS = 'pg_flow_pg_ts';
export const LOCAL_STORAGE_KEY_FOR_PG_VALIDITY = 180000; // ms - 180 seconds / 3 minutes

export async function initializeWordPressPlayground(
	iframe: HTMLIFrameElement,
	recommendedPhpVersion: string,
	setSearchParams: ( callback: ( prev: URLSearchParams ) => URLSearchParams ) => void
): Promise< PlaygroundClient > {
	let isWordPressInstalled = false;

	const url = new URL( window.location.href );
	let playgroundId: string | null = url.searchParams.get( 'playground' );
	if ( ! playgroundId ) {
		playgroundId = crypto.randomUUID();
		// update url in browser history
		url.searchParams.set( 'playground', playgroundId );
		window.history.replaceState( {}, '', url.toString() );
		// update search params through react router
		setSearchParams( ( prev ) => {
			prev.set( 'playground', playgroundId as string );
			return prev;
		} );
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
			initialSyncDirection: isWordPressInstalled ? 'opfs-to-memfs' : 'memfs-to-opfs',
		};

		const client = await startPlaygroundWeb( {
			iframe,
			remoteUrl: 'https://wordpress-playground.atomicsites.blog/remote.html',
			blueprint: await getBlueprint( isWordPressInstalled, recommendedPhpVersion ),
			shouldInstallWordPress: ! isWordPressInstalled,
			mounts: isWordPressInstalled ? [ mountDescriptor ] : [],
		} );

		if ( ! isWordPressInstalled ) {
			await client.mountOpfs( mountDescriptor );
		}

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
