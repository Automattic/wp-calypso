import config from '@automattic/calypso-config';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step, PluginsResponse, FailureInfo } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

export const installedStates = {
	PENDING: 'pending',
	INSTALLED: 'installed',
	ERROR: 'error',
} as const;

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const WaitForPluginInstall: Step = function WaitForAtomic( { navigation, data } ) {
	const { submit } = navigation;
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const pluginsToVerify = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPluginsToVerify(),
		[]
	);

	const siteId = data?.siteId;
	const siteSlug = data?.siteSlug;

	const handlePluginCheckFailure = ( failureInfo: FailureInfo ) => {
		recordTracksEvent( 'calypso_stepper_plugin_check_error', {
			action: failureInfo.type,
			site: siteId,
			code: failureInfo.code,
			error: failureInfo.error,
		} );

		logToLogstash( {
			feature: 'calypso_client',
			message: failureInfo.error,
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			blog_id: siteId,
			properties: {
				env: config( 'env_id' ),
				type: 'calypso_stepper_plugin_check_error',
				action: failureInfo.type,
				site: siteId,
				code: failureInfo.code,
			},
		} );
	};

	useEffect( () => {
		if ( ! siteId || ! siteSlug ) {
			return;
		}

		setPendingAction( async () => {
			const startTime = new Date().getTime();
			const totalTimeout = 1000 * 300;
			const maxFinishTime = startTime + totalTimeout;

			// Poll for transfer status. If there are no plugins to verify, we can skip this step.
			let stopPollingPlugins = ! pluginsToVerify || pluginsToVerify.length <= 0;
			let backoffTime = 1000;

			while ( ! stopPollingPlugins ) {
				await wait( backoffTime );

				try {
					const response: PluginsResponse = await wpcomRequest( {
						path: `/sites/${ siteId }/plugins`,
						apiVersion: '1.1',
					} );

					// Check that all plugins to verify have been installed.
					// If they _have_ been installed, we can stop polling.
					if ( response?.plugins && pluginsToVerify ) {
						stopPollingPlugins = pluginsToVerify.every( ( slug ) => {
							return response?.plugins.find( ( plugin: { slug: string } ) => plugin.slug === slug );
						} );
					}
				} catch ( err ) {
					// Ignore errors. It's normal to get errors the first couple of times we poll. The timeout will eventually catch it if the failures continue.
				}

				if ( maxFinishTime <= new Date().getTime() ) {
					handlePluginCheckFailure( {
						type: 'plugin_check_timeout',
						error: `plugin check took too long (${ totalTimeout / 1000 }s))`,
						code: 'plugin_check_timeout',
					} );
					throw new Error( `plugin check timeout exceeded ${ totalTimeout / 1000 }s` );
				}

				backoffTime *= 2;
			}

			return { pluginsInstalled: true, siteSlug, siteId };
		} );

		submit?.();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId, siteSlug ] );

	return null;
};

export default WaitForPluginInstall;
