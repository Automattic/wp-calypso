import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { SITE_STORE } from '../../../../stores';
import type { BundledPlugin } from '../../../plugin-bundle-data';
import type { Step, PluginsResponse } from '../../types';
import type { SiteSelect } from '@automattic/data-stores';
import './styles.scss';

type PluginsToCheckConfig = {
	[ key: string ]: string[];
};

// TODO: Move to a centered object.
const pluginsToCheckConfig: PluginsToCheckConfig = {
	'woo-on-plans': [ 'woocommerce' ],
};

const CheckForPlugins: Step = function CheckForPlugins( { navigation } ) {
	const { submit } = navigation;
	const site = useSite();
	const siteSlugParam = useSiteSlugParam();
	const pluginSlug = useSelect(
		( select ) =>
			( select( SITE_STORE ) as SiteSelect ).getBundledPluginSlug( siteSlugParam || '' ),
		[ siteSlugParam ]
	) as BundledPlugin;

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		const checkForPlugins = async () => {
			let hasPlugins = false;

			try {
				const response: PluginsResponse = await wpcomRequest( {
					path: `/sites/${ site?.ID }/plugins`,
					apiVersion: '1.1',
				} );

				const pluginsToCheck = pluginsToCheckConfig[ pluginSlug ];

				if ( pluginsToCheck ) {
					hasPlugins = pluginsToCheck.every(
						( pluginToCheck ) =>
							response?.plugins.find(
								( plugin: { slug: string } ) => plugin.slug === pluginToCheck
							) !== undefined
					);
				}
			} catch ( error ) {
				hasPlugins = false;
			}

			submit?.( { hasPlugins } );
		};

		checkForPlugins();

		// We don't need to include `submit` in the dependency array.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ site ] );

	return (
		<div className="step-container">
			<div className="step-container__content">
				<LoadingEllipsis />
			</div>
		</div>
	);
};

export default CheckForPlugins;
