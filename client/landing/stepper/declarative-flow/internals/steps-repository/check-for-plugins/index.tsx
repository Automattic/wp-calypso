import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import useSitePluginSlug from 'calypso/landing/stepper/hooks/use-site-plugin-slug';
import useBundleSettings from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import type { Step, PluginsResponse } from '../../types';
import './styles.scss';

const CheckForPlugins: Step = function CheckForPlugins( { navigation } ) {
	const { submit } = navigation;
	const site = useSite();
	const softwareSet = useSitePluginSlug();
	const bundleSettings = useBundleSettings( softwareSet );
	const checkForActivePlugins = bundleSettings?.checkForActivePlugins;

	useEffect( () => {
		if ( ! site || ! checkForActivePlugins ) {
			return;
		}

		const checkForPlugins = async () => {
			let hasPlugins = false;

			try {
				const response: PluginsResponse = await wpcomRequest( {
					path: `/sites/${ site?.ID }/plugins`,
					apiVersion: '1.1',
				} );

				hasPlugins = checkForActivePlugins.every(
					( pluginToCheck ) =>
						response?.plugins.find(
							( plugin: { slug: string } ) => plugin.slug === pluginToCheck
						) !== undefined
				);
			} catch ( error ) {
				hasPlugins = false;
			}

			submit?.( { hasPlugins } );
		};

		checkForPlugins();

		// We don't need to include `submit` in the dependency array.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ site, checkForActivePlugins ] );

	return (
		<div className="step-container">
			<div className="step-container__content">
				<LoadingEllipsis />
			</div>
		</div>
	);
};

export default CheckForPlugins;
