import { getAllFeaturesForPlan } from '@automattic/calypso-products/';
import { JetpackLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import FoldableCard from 'calypso/components/foldable-card';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSitePlanSlug, getSite } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionBox from '../quick-links/action-box';
import '../quick-links/style.scss';

const QuickLinks = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
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
	const hasBoost = site.options.jetpack_connection_active_plugins?.includes( 'jetpack-boost' );

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
		<div className="quick-links-for-devs__boxes quick-links__boxes">
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
			className="quick-links-for-devs quick-links"
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

export default QuickLinks;
