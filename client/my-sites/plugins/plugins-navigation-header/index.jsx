import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { Icon, upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NavigationHeader from 'calypso/components/navigation-header';
import { useLocalizedPlugins, useServerEffect } from 'calypso/my-sites/plugins/utils';
import { recordTracksEvent, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { appendBreadcrumb, resetBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
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
			<span className="plugins-browser__button-text">{ translate( 'Installed plugins' ) }</span>
		</Button>
	);
};

const PluginsNavigationHeader = ( { navigationHeaderRef, categoryName, category, search } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );

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
	const { localizePath } = useLocalizedPlugins();

	const setBreadcrumbs = ( breadcrumbs = [] ) => {
		const pluginsBreadcrumb = {
			label: translate( 'Plugins' ),
			href: localizePath( `/plugins/${ selectedSite?.slug || '' }` ),
			id: 'plugins',
		};

		if ( breadcrumbs?.length === 0 || ( ! category && ! search ) ) {
			dispatch( resetBreadcrumbs() );
			dispatch( appendBreadcrumb( pluginsBreadcrumb ) );
		}

		if ( category ) {
			resetBreadcrumbs();
			dispatch( appendBreadcrumb( pluginsBreadcrumb ) );
			dispatch(
				appendBreadcrumb( {
					label: categoryName,
					href: localizePath( `/plugins/browse/${ category }/${ selectedSite?.slug || '' }` ),
					id: 'category',
				} )
			);
		}

		if ( search ) {
			dispatch( resetBreadcrumbs() );
			dispatch( appendBreadcrumb( pluginsBreadcrumb ) );
			dispatch(
				appendBreadcrumb( {
					label: translate( 'Search Results' ),
					href: localizePath( `/plugins/${ selectedSite?.slug || '' }?s=${ search }` ),
					id: 'plugins-search',
				} )
			);
		}
	};

	const previousRoute = useSelector( getPreviousRoute );
	useEffect( () => {
		/* If translatations change, reset and update the breadcrumbs */
		if ( ! previousRoute ) {
			setBreadcrumbs();
		}
	}, [ translate ] );

	useServerEffect( () => {
		setBreadcrumbs();
	} );

	/* We need to get the breadcrumbs after the server has set them */
	const breadcrumbs = useSelector( getBreadcrumbs );

	useEffect( () => {
		setBreadcrumbs( breadcrumbs );
	}, [ selectedSite?.slug, search, category, categoryName, dispatch, localizePath ] );

	return (
		<NavigationHeader
			className="plugins-navigation-header"
			compactBreadcrumb={ isMobile }
			ref={ navigationHeaderRef }
			title={ translate( 'Plugins {{wbr}}{{/wbr}}marketplace', {
				components: { wbr: <wbr /> },
			} ) }
			loggedIn={ isLoggedIn }
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
