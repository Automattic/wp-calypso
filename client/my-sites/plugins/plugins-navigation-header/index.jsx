import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { Icon, upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NavigationHeader from 'calypso/components/navigation-header';
import { recordTracksEvent, recordGoogleEvent } from 'calypso/state/analytics/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const UploadPluginButton = ( { isMobile, siteSlug, hasUploadPlugins } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	if ( ! hasUploadPlugins ) {
		return null;
	}

	const uploadUrl = '/plugins/upload' + ( siteSlug ? '/' + siteSlug : '' );
	const handleUploadPluginButtonClick = () => {
		dispatch( recordTracksEvent( 'calypso_click_plugin_upload' ) );
		dispatch( recordGoogleEvent( 'Plugins', 'Clicked Plugin Upload Link' ) );
	};

	return (
		<Button
			className="plugins-browser__button"
			onClick={ handleUploadPluginButtonClick }
			href={ uploadUrl }
		>
			<Icon className="plugins-browser__button-icon" icon={ upload } width={ 18 } height={ 18 } />
			{ ! isMobile && (
				<span className="plugins-browser__button-text">{ translate( 'Upload' ) }</span>
			) }
		</Button>
	);
};

const ManageButton = ( {
	shouldShowManageButton,
	siteAdminUrl,
	siteSlug,
	jetpackNonAtomic,
	hasManagePlugins,
} ) => {
	const translate = useTranslate();

	if ( ! shouldShowManageButton ) {
		return null;
	}

	const site = siteSlug ? '/' + siteSlug : '';

	// When no site is selected eg `/plugins` or when Jetpack is self hosted
	// or if the site does not have the manage plugins feature show the
	// Calypso Plugins Manage page.
	// In any other case, redirect to current site WP Admin.
	const managePluginsDestination =
		! siteAdminUrl || jetpackNonAtomic || ! hasManagePlugins
			? `/plugins/manage${ site }`
			: `${ siteAdminUrl }plugins.php`;

	return (
		<Button className="plugins-browser__button" href={ managePluginsDestination }>
			<span className="plugins-browser__button-text">{ translate( 'Installed Plugins' ) }</span>
		</Button>
	);
};

const PluginsNavigationHeader = ( { navigationHeaderRef } ) => {
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );

	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);

	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, selectedSite?.ID ) );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );

	const isMobile = useBreakpoint( '<960px' );

	const hasInstallPurchasedPlugins = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);
	const hasManagePlugins = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS )
	);

	const shouldShowManageButton = useMemo( () => {
		return jetpackNonAtomic || ( isJetpack && ( hasInstallPurchasedPlugins || hasManagePlugins ) );
	}, [ jetpackNonAtomic, isJetpack, hasInstallPurchasedPlugins, hasManagePlugins ] );

	return (
		<NavigationHeader
			className="plugins-navigation-header"
			compactBreadcrumb={ isMobile }
			ref={ navigationHeaderRef }
			title={ translate( 'Plugins {{wbr}}{{/wbr}}marketplace', {
				components: { wbr: <wbr /> },
			} ) }
		>
			<ManageButton
				shouldShowManageButton={ shouldShowManageButton }
				siteAdminUrl={ siteAdminUrl }
				siteSlug={ selectedSite?.slug }
				jetpackNonAtomic={ jetpackNonAtomic }
				hasManagePlugins={ hasManagePlugins }
			/>

			<UploadPluginButton
				isMobile={ isMobile }
				siteSlug={ selectedSite?.slug }
				hasUploadPlugins={ !! selectedSite }
			/>
		</NavigationHeader>
	);
};

export default PluginsNavigationHeader;
