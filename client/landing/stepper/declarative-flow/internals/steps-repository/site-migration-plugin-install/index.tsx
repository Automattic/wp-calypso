/* eslint-disable no-console */
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import wpcom from 'calypso/lib/wp';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step } from '../../types';

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const SiteMigrationPluginInstall: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );
	const site = useSite();

	const siteId = site?.ID;

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		setPendingAction( async () => {
			setProgress( 0 );

			let stopPollingPlugins = false;
			let pollingPluginsRetry = 0;
			const maxRetry = 10;
			let installedPlugins = null;

			// Poll until plugins are installed. Once this is done, it's safe to install our plugin.
			while ( ! stopPollingPlugins ) {
				try {
					const response = await wpcom.req.get( `/sites/${ siteId }/plugins?http_envelope=1`, {
						apiNamespace: 'rest/v1.1',
					} );

					if ( response?.plugins ) {
						installedPlugins = response?.plugins;
						stopPollingPlugins = true;
						break;
					}

					pollingPluginsRetry++;
					if ( pollingPluginsRetry <= maxRetry ) {
						await wait( 5000 );
					} else {
						stopPollingPlugins = true;
					}
				} catch ( error ) {
					// Pause and retry after an error
					await wait( 3000 );
				}
			}
			const pluginAlreadyInstalled = installedPlugins.find(
				( plugin: { slug: string } ) => plugin.slug === 'migrate-guru'
			);

			if ( ! pluginAlreadyInstalled ) {
				// Install the plugin
				await wpcom.req.post( {
					path: `/sites/${ siteId }/plugins/migrate-guru/install`,
					apiNamespace: 'rest/v1.2',
				} );
			}

			// Activate the plugin
			await wpcom.req.post( {
				path: `/sites/${ siteId }/plugins/migrate-guru%2fmigrateguru`,
				apiNamespace: 'rest/v1.2',
				body: {
					active: true,
				},
			} );

			setProgress( 100 );

			return {
				pluginInstalled: true,
			};
		} );

		submit?.();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId ] );

	return null;
};

export default SiteMigrationPluginInstall;
