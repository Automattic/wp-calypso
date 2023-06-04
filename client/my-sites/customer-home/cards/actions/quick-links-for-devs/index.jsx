import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import FoldableCard from 'calypso/components/foldable-card';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import {
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
	isNewSite,
} from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionBox from '../quick-links/action-box';
import '../quick-links/style.scss';

export const QuickLinks = ( {
	isExpanded,
	updateHomeQuickLinksToggleStatus,
	siteSlug,
	siteAdminUrl,
	canManageSite,
	isAtomic,
} ) => {
	const translate = useTranslate();
	const [
		debouncedUpdateHomeQuickLinksToggleStatus,
		,
		flushDebouncedUpdateHomeQuickLinksToggleStatus,
	] = useDebouncedCallback( updateHomeQuickLinksToggleStatus, 1000 );

	const quickLinks = (
		<div className="quick-links-for-devs__boxes quick-links__boxes">
			<ActionBox
				href={ `/hosting-config/${ siteSlug }#sftp-credentials` }
				hideLinkIndicator
				label={ translate( 'Setup SSH' ) }
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
				label={ translate( 'Explores themes' ) }
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

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const isStaticHomePage =
		! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' );
	const siteSlug = getSelectedSiteSlug( state );
	const staticHomePageId = getSiteFrontPage( state, siteId );
	const editHomePageUrl = isStaticHomePage && `/page/${ siteSlug }/${ staticHomePageId }`;

	return {
		menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
		isNewlyCreatedSite: isNewSite( state, siteId ),
		canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
		siteSlug,
		isStaticHomePage,
		isAtomic: isSiteAtomic( state, siteId ),
		editHomePageUrl,
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		isExpanded: getPreference( state, 'homeQuickLinksToggleStatus' ) !== 'collapsed',
	};
};

const mapDispatchToProps = {
	updateHomeQuickLinksToggleStatus: ( status ) =>
		savePreference( 'homeQuickLinksToggleStatus', status ),
};

export default connect( mapStateToProps, mapDispatchToProps )( QuickLinks );
