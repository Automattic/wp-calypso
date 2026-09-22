import config from '@automattic/calypso-config';
import { logToLogstash } from 'calypso/lib/logstash';
import { getBlueprint } from './blueprint';
import { PLAYGROUND_HOST } from './constants';
import type { Blueprint, BlueprintV1, MountDescriptor, PlaygroundClient } from './types';

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
		// The Calypso Playground ID is also the saved-site slug used by the export API.
		const playgroundSlug = playgroundId;
		const mountDescriptor: MountDescriptor = {
			device: {
				type: 'opfs',
				path: `/sites/site-${ encodeURIComponent( playgroundSlug ) }`,
			},
			mountpoint: '/wordpress',
			initialSyncDirection: isWordPressInstalled ? 'opfs-to-memfs' : 'memfs-to-opfs',
		};

		const blueprint = await getBlueprint( isWordPressInstalled, recommendedPhpVersion );
		const { getBlueprintDeclaration, startPlaygroundWeb } = await import(
			/* webpackIgnore: true */ PLAYGROUND_HOST + '/client/index.js'
		);
		onPlaygroundClientLoaded?.();
		const client = await startPlaygroundWeb( {
			iframe,
			remoteUrl: PLAYGROUND_HOST + '/remote.html',
			scope: playgroundSlug,
			blueprint: blueprint as BlueprintV1,
			shouldInstallWordPress: ! isWordPressInstalled,
			mounts: isWordPressInstalled ? [ mountDescriptor ] : [],
		} );

		if ( ! isWordPressInstalled ) {
			const blueprintDeclaration = await getBlueprintDeclaration( blueprint );
			await client.writeFile(
				'/wordpress/wp-runtime.json',
				JSON.stringify(
					{
						id: playgroundSlug,
						name: 'WordPress.com Playground',
						originalBlueprint: blueprintDeclaration,
						originalBlueprintSource: { type: 'none' },
						persistence: 'explicit',
						runtimeConfiguration: {
							constants: blueprintDeclaration.constants ?? {},
							extraLibraries: blueprintDeclaration.extraLibraries ?? [],
							intl: blueprintDeclaration.features?.intl ?? false,
							networking: blueprintDeclaration.features?.networking ?? true,
							phpVersion: blueprintDeclaration.preferredVersions?.php ?? recommendedPhpVersion,
							wpVersion: blueprintDeclaration.preferredVersions?.wp ?? 'latest',
						},
						slug: playgroundSlug,
						storage: 'opfs',
					},
					null,
					2
				)
			);
			await client.mountOpfs( mountDescriptor );

			// mountOpfs() starts the final journal flush without waiting for it, and each
			// flush pass holds PHP's single-request semaphore. Wait for it here so the
			// first request after the Playground becomes interactive isn't queued behind it.
			await client.flushOpfs( mountDescriptor.mountpoint );
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
