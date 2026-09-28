import { sitePurchasesQuery } from '@automattic/api-queries';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export const ThankYouPluginSection = ( { plugin }: { plugin: any } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const hasManagePluginsFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_MANAGE_PLUGINS )
	);
	const managePluginsUrl = hasManagePluginsFeature
		? `${ siteAdminUrl }plugins.php`
		: `/plugins/${ plugin.slug }/${ siteSlug } `;
	const fallbackSetupUrl =
		plugin?.setup_url && siteAdminUrl ? siteAdminUrl + plugin.setup_url : null;
	const setupURL = plugin?.action_links?.Settings || fallbackSetupUrl || managePluginsUrl;
	const documentationURL = plugin?.documentation_url;
	const {
		data: purchases,
		isSuccess,
		isFetching,
	} = useQuery( {
		...sitePurchasesQuery( siteId ?? 0 ),
		enabled: !! siteId,
	} );
	const hasLoadedPurchases = isSuccess && ! isFetching;
	const [ expirationDate, setExpirationDate ] = useState( '' );

	const productPurchase = useMemo(
		() => getPluginPurchased( plugin, purchases || [] ),
		[ plugin, purchases ]
	);

	useEffect( () => {
		if ( hasLoadedPurchases ) {
			if ( productPurchase ) {
				setExpirationDate(
					translate( 'Expires on %s', {
						args: moment( productPurchase.expiry_date ).format( 'LL' ),
					} ).toString()
				);
			} else {
				setExpirationDate( translate( "This plugin doesn't expire" ) );
			}
		}
	}, [ plugin, hasLoadedPurchases, translate, productPurchase ] );

	const sendTrackEvent = useCallback(
		( name: string, link: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				plugin: plugin.slug,
				link,
			} );
		},
		[ siteId, plugin ]
	);

	return (
		<>
			<ThankYouProduct
				name={ plugin.name }
				details={ expirationDate }
				icon={ plugin.icon }
				actions={
					<>
						<Button
							variant="secondary"
							href={ setupURL }
							onClick={ () =>
								sendTrackEvent( 'calypso_plugin_thank_you_manage_plugin_click', setupURL )
							}
						>
							{ translate( 'Manage plugin' ) }
						</Button>
						{ documentationURL && (
							<Button
								variant="secondary"
								href={ documentationURL }
								onClick={ () =>
									sendTrackEvent( 'calypso_plugin_thank_you_plugin_guide_click', documentationURL )
								}
							>
								{ translate( 'Plugin guide' ) }
							</Button>
						) }
					</>
				}
				isLoading={ expirationDate === '' }
			/>
		</>
	);
};
