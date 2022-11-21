import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_UPLOAD_PLUGINS,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { Icon, upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useLocalizedPlugins, useServerEffect } from 'calypso/my-sites/plugins/utils';
import { recordTracksEvent, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { appendBreadcrumb, resetBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

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

const PluginsNavigationHeader = ( { navigationHeaderRef, categoryName, category, search } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );

	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);

	const hasUploadPlugins = useSelector(
		( state ) =>
			siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_UPLOAD_PLUGINS ) || jetpackNonAtomic
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

	const setBreadcrumbs = useCallback(
		( isBreadcrumbsPopulated ) => {
			if ( ! isBreadcrumbsPopulated || ( ! category && ! search ) ) {
				dispatch( resetBreadcrumbs() );
				dispatch(
					appendBreadcrumb( {
						label: translate( 'Plugins' ),
						href: localizePath( `/plugins/${ selectedSite?.slug || '' }` ),
						id: 'plugins',
						helpBubble: translate(
							'Add new functionality and integrations to your site with plugins. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
							{
								components: {
									learnMoreLink: <InlineSupportLink supportContext="plugins" showIcon={ false } />,
								},
							}
						),
					} )
				);
			}

			if ( category ) {
				dispatch(
					appendBreadcrumb( {
						label: categoryName,
						href: localizePath( `/plugins/browse/${ category }/${ selectedSite?.slug || '' }` ),
						id: 'category',
					} )
				);
			}

			if ( search ) {
				dispatch(
					appendBreadcrumb( {
						label: translate( 'Search Results' ),
						href: localizePath( `/plugins/${ selectedSite?.slug || '' }?s=${ search }` ),
						id: 'plugins-search',
					} )
				);
			}
		},
		[ selectedSite?.slug, search, category, categoryName, dispatch, translate, localizePath ]
	);
	useServerEffect( setBreadcrumbs );

	// We need to get the breadcrumbs here, after initial append dispatches on server.
	const breadcrumbs = useSelector( getBreadcrumbs );

	useEffect( () => {
		setBreadcrumbs( breadcrumbs.length !== 0 );
	}, [ setBreadcrumbs, breadcrumbs.length ] );

	return (
		<FixedNavigationHeader
			navigationItems={ breadcrumbs }
			compactBreadcrumb={ isMobile }
			ref={ navigationHeaderRef }
		>
			<div className="plugins-browser__main-buttons">
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
					hasUploadPlugins={ hasUploadPlugins }
				/>
			</div>
		</FixedNavigationHeader>
	);
};

export default PluginsNavigationHeader;
