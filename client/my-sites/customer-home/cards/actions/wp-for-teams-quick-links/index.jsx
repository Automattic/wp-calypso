import { FoldableCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import { getSiteFrontPage, getCustomizerUrl, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionBox from '../quick-links/action-box';
import '../quick-links/style.scss';

export const QuickLinks = ( {
	customizeUrl,
	menusUrl,
	trackWritePostAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	trackAddP2UsersAction,
	isExpanded,
	updateHomeQuickLinksToggleStatus,
	siteSlug,
	isP2Hub,
} ) => {
	const translate = useTranslate();
	const [
		debouncedUpdateHomeQuickLinksToggleStatus,
		,
		flushDebouncedUpdateHomeQuickLinksToggleStatus,
	] = useDebouncedCallback( updateHomeQuickLinksToggleStatus, 1000 );

	const quickLinks = (
		<div className="wp-for-teams-quick-links__boxes quick-links__boxes">
			{ isP2Hub && (
				<>
					<ActionBox
						href={ `/people/new/${ siteSlug }` }
						hideLinkIndicator
						onClick={ trackAddP2UsersAction }
						label={ translate( 'Invite people to this workspace' ) }
						materialIcon="person"
					/>
				</>
			) }
			{ ! isP2Hub && (
				<>
					<ActionBox
						href={ `/post/${ siteSlug }` }
						hideLinkIndicator
						onClick={ trackWritePostAction }
						label={ translate( 'Write a post' ) }
						materialIcon="edit"
					/>
					<ActionBox
						href={ menusUrl }
						hideLinkIndicator
						onClick={ trackEditMenusAction }
						label={ translate( 'Edit menus' ) }
						materialIcon="list"
					/>
					<ActionBox
						href={ customizeUrl }
						hideLinkIndicator
						onClick={ trackCustomizeThemeAction }
						label={ translate( 'Customize theme' ) }
						materialIcon="palette"
					/>
				</>
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
			className="wp-for-teams-quick-links quick-links customer-home__card"
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

const trackWritePostAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_write_post_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_write_post' )
		)
	);
};

const trackEditMenusAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_edit_menus_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_edit_menus' )
	);

const trackCustomizeThemeAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_customize_theme_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_customize_theme' )
	);

const trackAddP2UsersAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_p2_invite_users_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_p2_invite_users' )
		)
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isStaticHomePage = 'page' === getSiteOption( state, siteId, 'show_on_front' );
	const siteSlug = getSelectedSiteSlug( state );
	const staticHomePageId = getSiteFrontPage( state, siteId );
	const editHomePageUrl = isStaticHomePage && `/page/${ siteSlug }/${ staticHomePageId }`;
	const isP2Hub = isSiteP2Hub( state, siteId );

	return {
		customizeUrl: getCustomizerUrl( state, siteId ),
		menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
		isP2Hub,
		siteSlug,
		isStaticHomePage,
		editHomePageUrl,
		isExpanded: getPreference( state, 'homeQuickLinksToggleStatus' ) !== 'collapsed',
	};
};

const mapDispatchToProps = {
	trackWritePostAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	trackAddP2UsersAction,
	updateHomeQuickLinksToggleStatus: ( status ) =>
		savePreference( 'homeQuickLinksToggleStatus', status ),
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...stateProps,
		...dispatchProps,
		trackWritePostAction: () => dispatchProps.trackWritePostAction( isStaticHomePage ),
		trackEditMenusAction: () => dispatchProps.trackEditMenusAction( isStaticHomePage ),
		trackCustomizeThemeAction: () => dispatchProps.trackCustomizeThemeAction( isStaticHomePage ),
		trackAddP2UsersAction: () => dispatchProps.trackAddP2UsersAction( isStaticHomePage ),
		...ownProps,
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( QuickLinks );
