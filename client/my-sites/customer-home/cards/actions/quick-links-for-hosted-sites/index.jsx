import { getAllFeaturesForPlan } from '@automattic/calypso-products';
import { JetpackLogo, FoldableCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSitePlanSlug, getSite, getSiteOption } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { trackAddDomainAction, trackManageAllDomainsAction } from '../quick-links';
import ActionBox from '../quick-links/action-box';
import '../quick-links/style.scss';

const QuickLinksForHostedSites = ( props ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isAtomic = useSelector( ( state ) => isSiteAtomic( state, siteId ) );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const canManageSite = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);
	const isExpanded = useSelector(
		( state ) => getPreference( state, 'homeQuickLinksToggleStatus' ) !== 'collapsed'
	);
	const currentSitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const hasBackups = getAllFeaturesForPlan( currentSitePlanSlug ).includes( 'backups' );
	const hasBoost = site?.options?.jetpack_connection_active_plugins?.includes( 'jetpack-boost' );
	const isWpcomStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );

	const dispatch = useDispatch();
	const updateToggleStatus = ( status ) => {
		dispatch( savePreference( 'homeQuickLinksToggleStatus', status ) );
	};
	const [
		debouncedUpdateHomeQuickLinksToggleStatus,
		,
		flushDebouncedUpdateHomeQuickLinksToggleStatus,
	] = useDebouncedCallback( updateToggleStatus, 1000 );

	const quickLinks = (
		<div className="quick-links-for-hosted-sites__boxes quick-links__boxes">
			<ActionBox
				href={ `/hosting-config/${ siteSlug }#sftp-credentials` }
				hideLinkIndicator
				label={ translate( 'Set up SSH' ) }
				materialIcon="key"
			/>
			<ActionBox
				href={ `/hosting-config/${ siteSlug }#staging-site` }
				hideLinkIndicator
				label={ translate( 'Create staging site' ) }
				gridicon="science"
			/>
			{ isAtomic && (
				<ActionBox
					href={ `/setup/copy-site/domains?sourceSlug=${ siteSlug }` }
					hideLinkIndicator
					label={ translate( 'Copy site' ) }
					materialIcon="sync_alt"
				/>
			) }
			{ canManageSite && (
				<ActionBox
					href={ `/plugins/${ siteSlug }` }
					hideLinkIndicator
					label={ translate( 'Explore Plugins' ) }
					gridicon="plugins"
				/>
			) }
			<ActionBox
				href={ `/themes/${ siteSlug }` }
				hideLinkIndicator
				label={ translate( 'Explore themes' ) }
				materialIcon="view_quilt"
			/>
			{ canManageSite && ! isWpcomStagingSite && (
				<ActionBox
					href={ `/domains/add/${ siteSlug }` }
					hideLinkIndicator
					onClick={ props.trackAddDomainAction }
					label={ translate( 'Add a domain' ) }
					gridicon="add-outline"
				/>
			) }
			{ canManageSite && (
				<ActionBox
					href="/domains/manage"
					hideLinkIndicator
					onClick={ props.trackManageAllDomainsAction }
					label={ translate( 'Manage all domains' ) }
					gridicon="domains"
				/>
			) }
			{ siteAdminUrl && (
				<ActionBox
					href={ siteAdminUrl }
					hideLinkIndicator
					gridicon="my-sites"
					label={ translate( 'WP Admin Dashboard' ) }
				/>
			) }
			{ isAtomic && hasBoost && (
				<ActionBox
					href={ `https://${ siteSlug }/wp-admin/admin.php?page=jetpack-boost` }
					hideLinkIndicator
					label={ translate( 'Speed up your site' ) }
					iconComponent={ <JetpackLogo monochrome className="quick-links__action-box-icon" /> }
				/>
			) }
			{ isAtomic && hasBackups && (
				<ActionBox
					href={ `/backup/${ siteSlug }` }
					hideLinkIndicator
					label={ translate( 'Restore a backup' ) }
					iconComponent={ <JetpackLogo monochrome className="quick-links__action-box-icon" /> }
				/>
			) }
		</div>
	);

	useEffect( () => {
		return () => {
			flushDebouncedUpdateHomeQuickLinksToggleStatus();
		};
	}, [] );

	return (
		<FoldableCard
			className="quick-links-for-hosted-sites quick-links"
			header={ translate( 'Quick Links' ) }
			clickableHeader
			expanded={ isExpanded }
			onOpen={ () => debouncedUpdateHomeQuickLinksToggleStatus( 'expanded' ) }
			onClose={ () => debouncedUpdateHomeQuickLinksToggleStatus( 'collapsed' ) }
		>
			{ quickLinks }
		</FoldableCard>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isStaticHomePage = 'page' === getSiteOption( state, siteId, 'show_on_front' );

	return {
		isStaticHomePage,
	};
};

const mapDispatchToProps = {
	trackAddDomainAction,
	trackManageAllDomainsAction,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...stateProps,
		...dispatchProps,
		trackAddDomainAction: () => dispatchProps.trackAddDomainAction( isStaticHomePage ),
		trackManageAllDomainsAction: () =>
			dispatchProps.trackManageAllDomainsAction( isStaticHomePage ),
		...ownProps,
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( QuickLinksForHostedSites );
