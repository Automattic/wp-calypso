import {
	FEATURE_TYPE_JETPACK_BACKUP,
	PLAN_BUSINESS,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	WPCOM_FEATURES_ATOMIC,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback } from 'react';
import VaultPressLogo from 'calypso/assets/images/jetpack/vaultpress-logo.svg';
import DocumentHead from 'calypso/components/data/document-head';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import JetpackDisconnected from 'calypso/components/jetpack/jetpack-disconnected';
import Upsell from 'calypso/components/jetpack/upsell';
import UpsellProductCard from 'calypso/components/jetpack/upsell-product-card';
import UpsellProductWpcomPlanCard from 'calypso/components/jetpack/upsell-product-wpcom-plan-card';
import { UpsellComponentProps } from 'calypso/components/jetpack/upsell-switch';
import WPCOMBusinessAT from 'calypso/components/jetpack/wpcom-business-at';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { recordLogRocketEvent } from 'calypso/lib/analytics/logrocket';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

import './style.scss';

const BackupsUpsellIcon: FunctionComponent = () => (
	<div className="backup-upsell__icon-header">
		<img
			src="/calypso/images/illustrations/jetpack-cloud-backup-error.svg"
			alt="jetpack cloud backup error"
		/>
	</div>
);

const VaultPressIcon = () => (
	<div className="backup-upsell__icon-header">
		<img src={ VaultPressLogo } alt="VaultPress logo" />
	</div>
);

const BackupsMultisiteBody: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<Upsell
			headerText={ translate( 'WordPress multi-sites are not supported' ) }
			bodyText={ translate(
				"We're sorry, Jetpack VaultPress Backup is not compatible with multisite WordPress installations at this time."
			) }
			iconComponent={ <BackupsUpsellIcon /> }
		/>
	);
};

const BackupsVPActiveBody: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return (
		<Upsell
			headerText={ translate( 'Your backups are powered by VaultPress' ) }
			bodyText={ translate( 'You can access them on your VaultPress Dashboard.' ) }
			buttonLink="https://dashboard.vaultpress.com/"
			buttonText={ translate( 'Visit Dashboard' ) }
			onClick={ () => dispatch( recordTracksEvent( 'calypso_jetpack_backup_vaultpress_click' ) ) }
			iconComponent={ <VaultPressIcon /> }
		/>
	);
};

const BackupsUpsellBody: FunctionComponent = () => {
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const dispatch = useDispatch();
	const isSimple = useSelector( isSimpleSite );

	const onClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_upsell_click' ) );
		recordLogRocketEvent( 'calypso_jetpack_backup_upsell_click' );
	}, [ dispatch ] );

	return (
		<>
			<QueryJetpackSaleCoupon />
			{ isSimple && <QueryProductsList /> }
			{ ! isSimple && <QueryProductsList type="jetpack" /> }
			{ siteId && <QueryIntroOffers siteId={ siteId } /> }
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			{ isSimple && (
				<UpsellProductWpcomPlanCard
					WPcomPlanSlug={ PLAN_BUSINESS }
					nonManageProductSlug={ PRODUCT_JETPACK_BACKUP_T1_YEARLY }
					siteId={ siteId }
					onCtaButtonClick={ onClick }
				/>
			) }
			{ ! isSimple && (
				<UpsellProductCard
					featureType={ FEATURE_TYPE_JETPACK_BACKUP }
					nonManageProductSlug={ PRODUCT_JETPACK_BACKUP_T1_YEARLY }
					siteId={ siteId }
					onCtaButtonClick={ onClick }
				/>
			) }
		</>
	);
};

const BackupsUpsellPage: FunctionComponent< UpsellComponentProps > = ( { reason } ) => {
	const siteId = useSelector( getSelectedSiteId ) || -1;
	const canTransfer = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC )
	);

	// We know the site is not AT as it's not Jetpack,
	// so show the activation for Atomic plans.
	if ( canTransfer ) {
		return <WPCOMBusinessAT />;
	}

	let body;
	switch ( reason ) {
		case 'vp_active_on_site':
			body = <BackupsVPActiveBody />;
			break;
		case 'multisite_not_supported':
			body = <BackupsMultisiteBody />;
			break;
		case 'no_connected_jetpack':
			body = <JetpackDisconnected />;
			break;
		default:
			body = <BackupsUpsellBody />;
			break;
	}
	return (
		<Main className="backup-upsell" wideLayout>
			<DocumentHead title="VaultPress Backup" />
			<SidebarNavigation />
			<div className="backup-upsell__content">{ body }</div>
		</Main>
	);
};

export default BackupsUpsellPage;
