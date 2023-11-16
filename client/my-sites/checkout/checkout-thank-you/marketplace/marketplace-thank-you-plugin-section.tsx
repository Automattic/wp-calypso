import { recordTracksEvent } from '@automattic/calypso-analytics';
import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import { useSelector } from 'calypso/state';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const PluginSectionContainer = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	box-sizing: border-box;
	align-items: center;
	gap: 16px;
	padding: 24px;
	border-radius: 2px;
	border: 1px solid var( --color-border-subtle );
	flex-wrap: wrap;

	div {
		min-width: auto;
	}

	@media ( min-width: 782px ) {
		width: 720px;
	}

	@media ( min-width: 480px ) {
		padding: 20px 25px;
	}
`;

const PluginSectionContent = styled.div`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	flex-basis: 100%;
	@media ( min-width: 480px ) {
		flex-basis: initial;
	}
`;

const PluginSectionName = styled.div`
	font-size: 16px;
	font-weight: 500;
	line-height: 24px;
	color: var( --studio-gray-100 );
	flex-grow: 1;
`;

const PluginSectionExpirationDate = styled.div`
	font-size: 14px;
	line-height: 22px;
	color: var( --studio-gray-60 );
`;

const PluginSectionButtons = styled.div`
	display: flex;
	flex-shrink: 0;
	gap: 16px;
	min-width: auto;
`;

const PluginButton = styled( Button )`
	border-radius: 4px;
`;

const PluginIcon = styled.img`
	border-radius: 10px;
	box-shadow:
		0px 15px 20px rgba( 0, 0, 0, 0.04 ),
		0px 13px 10px rgba( 0, 0, 0, 0.03 ),
		0px 6px 6px rgba( 0, 0, 0, 0.02 );
`;

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
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);
	const [ expirationDate, setExpirationDate ] = useState( '' );

	const productPurchase = useMemo(
		() => getPluginPurchased( plugin, purchases || [] ),
		[ plugin, purchases ]
	);

	useEffect( () => {
		if ( ! isLoadingPurchases ) {
			if ( productPurchase ) {
				setExpirationDate(
					translate( 'Expires on %s', {
						args: moment( productPurchase.expiryDate ).format( 'LL' ),
					} ).toString()
				);
			} else {
				setExpirationDate( translate( "This plugin doesn't expire" ) );
			}
		}
	}, [ plugin, isLoadingPurchases, translate, productPurchase ] );

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
		<PluginSectionContainer>
			<QuerySitePurchases siteId={ siteId } />
			<PluginIcon
				width={ 50 }
				height={ 50 }
				src={ plugin.icon }
				alt={
					translate( "%(plugin)s's icon", {
						args: {
							plugin: plugin.name,
						},
					} ) as string
				}
			/>
			<PluginSectionContent>
				<PluginSectionName>{ plugin.name }</PluginSectionName>
				{ isLoadingPurchases && <Spinner /> }
				{ expirationDate && (
					<PluginSectionExpirationDate>{ expirationDate }</PluginSectionExpirationDate>
				) }
			</PluginSectionContent>
			<PluginSectionButtons>
				<PluginButton
					href={ setupURL }
					onClick={ () =>
						sendTrackEvent( 'calypso_plugin_thank_you_manage_plugin_click', setupURL )
					}
				>
					{ translate( 'Manage plugin' ) }
				</PluginButton>
				{ documentationURL && (
					<PluginButton
						href={ documentationURL }
						onClick={ () =>
							sendTrackEvent( 'calypso_plugin_thank_you_plugin_guide_click', documentationURL )
						}
					>
						{ translate( 'Plugin guide' ) }
					</PluginButton>
				) }
			</PluginSectionButtons>
		</PluginSectionContainer>
	);
};
