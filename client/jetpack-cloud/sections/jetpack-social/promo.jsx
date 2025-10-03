import {
	FEATURE_SOCIAL_ENHANCED_PUBLISHING,
	FEATURE_TYPE_JETPACK_SOCIAL,
	PRODUCT_JETPACK_SOCIAL_V1_YEARLY,
} from '@automattic/calypso-products';
import { format as formatUrl, getUrlParts, getUrlFromParts } from '@automattic/calypso-url';
import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import SocialImage from 'calypso/assets/images/jetpack/rna-image-social.png';
import DocumentHead from 'calypso/components/data/document-head';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-rna-action-card';
import UpsellProductCard from 'calypso/components/jetpack/upsell-product-card';
import Main from 'calypso/components/main';
import { preventWidows } from 'calypso/lib/formatting';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite, isJetpackConnectionPluginActive } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './promo.scss';

export const Promo = ( { adminUrl, pluginInstallUrl, translate, siteId } ) => {
	const titleHeader = translate( 'Social', { context: 'Jetpack product name' } );

	const dispatch = useDispatch();

	const onClick = useCallback(
		() => dispatch( recordTracksEvent( 'calypso_jetpack_social_upsell_click' ) ),
		[ dispatch ]
	);

	const isLoadingFeatures = useSelector( ( state ) => isRequestingSiteFeatures( state, siteId ) );
	const hasPaidFeatures = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_SOCIAL_ENHANCED_PUBLISHING )
	);

	const product = slugToSelectorProduct( PRODUCT_JETPACK_SOCIAL_V1_YEARLY );

	// Try to guide the user as best as possible.
	// If we have an admin URL, we can send the user directly to the Social settings.
	// If we don't have an admin URL, we can send the user to the plugin install page.
	// If we don't have either, we can send the user to the plugin page on WordPress.org.
	const ctaButtonURL =
		adminUrl || pluginInstallUrl || 'https://wordpress.org/plugins/jetpack-social';

	const ctaButtonLabel = adminUrl
		? translate( 'Enable Social sharing' )
		: translate( 'Get Started' );

	return (
		<Main wideLayout className="jetpack-social__promo">
			<DocumentHead title={ titleHeader } />
			<QueryProductsList type="jetpack" />
			{ siteId && <QueryIntroOffers siteId={ siteId } /> }
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			<div className="jetpack-social__promo-content">
				{
					// If the site already has a paid plan active, show the publicize activation card.
					hasPaidFeatures || isLoadingFeatures ? (
						<JetpackRnaActionCard
							headerText={ product.displayName }
							subHeaderText={ product.description }
							cardImage={ SocialImage }
							cardImageAlt={ ctaButtonLabel }
							// Disable the button while we're loading the features.
							ctaButtonURL={ isLoadingFeatures ? '' : ctaButtonURL }
							ctaButtonLabel={ ctaButtonLabel }
							ctaButtonExternal
						>
							<ul className="jetpack-social__features">
								{ product.features.items.map( ( feature ) => (
									<li className="jetpack-social__feature" key={ feature.slug }>
										<Gridicon size={ 18 } icon="checkmark" /> { preventWidows( feature.text ) }
									</li>
								) ) }
							</ul>
						</JetpackRnaActionCard>
					) : (
						<UpsellProductCard
							featureType={ FEATURE_TYPE_JETPACK_SOCIAL }
							nonManageProductSlug={ PRODUCT_JETPACK_SOCIAL_V1_YEARLY }
							siteId={ siteId }
							onCtaButtonClick={ onClick }
						/>
					)
				}
			</div>
		</Main>
	);
};

const getSocialAdminUrl = ( state, siteId ) => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	if ( null === siteAdminUrl ) {
		return undefined;
	}

	const isSocialActive = isJetpackConnectionPluginActive( state, siteId, 'jetpack-social' );
	const isJetpackActive = isJetpackSite( state, siteId, { considerStandaloneProducts: false } );

	const hasAPluginToManageConnections = isSocialActive || isJetpackActive;

	const canManageOptions = canCurrentUser( state, siteId, 'manage_options' );

	if ( ! hasAPluginToManageConnections || ! canManageOptions ) {
		return undefined;
	}

	// Prefer Social over Jetpack.
	const page = isSocialActive ? 'jetpack-social' : 'jetpack#/sharing';

	// Use direct query params instead of URLSearchParams to avoid "#" getting encoded.
	const parts = getUrlParts( siteAdminUrl + `admin.php?page=${ page }` );

	return formatUrl( getUrlFromParts( parts ) );
};

const getSocialPluginInstallUrl = ( state, siteId ) => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	if ( null === siteAdminUrl ) {
		return undefined;
	}

	// Ensure that we have the necessary permissions to install plugins.
	if ( ! canCurrentUser( state, siteId, 'activate_plugins' ) ) {
		return undefined;
	}

	const parts = getUrlParts( siteAdminUrl + 'plugin-install.php' );

	parts.searchParams.set( 'tab', 'plugin-information' );
	parts.searchParams.set( 'plugin', 'jetpack-social' );

	return formatUrl( getUrlFromParts( parts ) );
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	const adminUrl = getSocialAdminUrl( state, siteId );
	const pluginInstallUrl = ! adminUrl ? getSocialPluginInstallUrl( state, siteId ) : undefined;

	return {
		siteId,
		adminUrl,
		pluginInstallUrl,
	};
} )( localize( Promo ) );
