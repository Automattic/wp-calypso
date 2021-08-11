import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import FoldableCard from 'calypso/components/foldable-card';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import isSiteUsingFullSiteEditing from 'calypso/state/selectors/is-site-using-full-site-editing';
import {
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
	isNewSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionBox from '../quick-links/action-box';

import '../quick-links/style.scss';

export const QuickLinks = ( {
	customizeUrl,
	isStaticHomePage,
	showCustomizer,
	menusUrl,
	trackEditHomepageAction,
	trackWritePostAction,
	trackAddPageAction,
	trackManageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	isExpanded,
	updateHomeQuickLinksToggleStatus,
	editHomePageUrl,
	siteSlug,
} ) => {
	const translate = useTranslate();
	const [
		debouncedUpdateHomeQuickLinksToggleStatus,
		,
		flushDebouncedUpdateHomeQuickLinksToggleStatus,
	] = useDebouncedCallback( updateHomeQuickLinksToggleStatus, 1000 );

	const quickLinks = (
		<div className="wp-for-teams-quick-links__boxes quick-links__boxes">
			{ isStaticHomePage ? (
				<ActionBox
					href={ editHomePageUrl }
					hideLinkIndicator
					onClick={ trackEditHomepageAction }
					label={ translate( 'Edit homepage' ) }
					materialIcon="laptop"
				/>
			) : (
				<ActionBox
					href={ `/post/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackWritePostAction }
					label={ translate( 'Write blog post' ) }
					materialIcon="edit"
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					href={ `/page/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackAddPageAction }
					label={ translate( 'Add a page' ) }
					materialIcon="insert_drive_file"
				/>
			) : (
				<ActionBox
					href={ `/comments/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackManageCommentsAction }
					label={ translate( 'Manage comments' ) }
					materialIcon="mode_comment"
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					href={ `/post/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackWritePostAction }
					label={ translate( 'Write blog post' ) }
					materialIcon="edit"
				/>
			) : (
				<ActionBox
					href={ `/page/${ siteSlug }` }
					hideLinkIndicator
					onClick={ trackAddPageAction }
					label={ translate( 'Add a page' ) }
					materialIcon="insert_drive_file"
				/>
			) }
			{ showCustomizer && (
				<ActionBox
					href={ menusUrl }
					hideLinkIndicator
					onClick={ trackEditMenusAction }
					label={ translate( 'Edit menus' ) }
					materialIcon="list"
				/>
			) }
			{ showCustomizer && (
				<ActionBox
					href={ customizeUrl }
					hideLinkIndicator
					onClick={ trackCustomizeThemeAction }
					label={ translate( 'Customize theme' ) }
					materialIcon="palette"
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
			className="wp-for-teams-quick-links quick-links"
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

const trackEditHomepageAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_edit_homepage_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_edit_homepage' )
		)
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

const trackAddPageAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_page_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_page' )
		)
	);
};

const trackManageCommentsAction = ( isStaticHomePage ) => ( dispatch ) => {
	dispatch(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_manage_comments_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_manage_comments' )
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

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const isStaticHomePage =
		! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' );
	const siteSlug = getSelectedSiteSlug( state );
	const staticHomePageId = getSiteFrontPage( state, siteId );
	const editHomePageUrl = isStaticHomePage && `/page/${ siteSlug }/${ staticHomePageId }`;

	return {
		customizeUrl: getCustomizerUrl( state, siteId ),
		menusUrl: getCustomizerUrl( state, siteId, 'menus' ),
		isNewlyCreatedSite: isNewSite( state, siteId ),
		showCustomizer: ! isSiteUsingFullSiteEditing( state, siteId ),
		siteSlug,
		isStaticHomePage,
		editHomePageUrl,
		isExpanded: getPreference( state, 'homeQuickLinksToggleStatus' ) !== 'collapsed',
	};
};

const mapDispatchToProps = {
	trackEditHomepageAction,
	trackWritePostAction,
	trackAddPageAction,
	trackManageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	updateHomeQuickLinksToggleStatus: ( status ) =>
		savePreference( 'homeQuickLinksToggleStatus', status ),
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...stateProps,
		...dispatchProps,
		trackEditHomepageAction: () => dispatchProps.trackEditHomepageAction( isStaticHomePage ),
		trackWritePostAction: () => dispatchProps.trackWritePostAction( isStaticHomePage ),
		trackAddPageAction: () => dispatchProps.trackAddPageAction( isStaticHomePage ),
		trackManageCommentsAction: () => dispatchProps.trackManageCommentsAction( isStaticHomePage ),
		trackEditMenusAction: () => dispatchProps.trackEditMenusAction( isStaticHomePage ),
		trackCustomizeThemeAction: () => dispatchProps.trackCustomizeThemeAction( isStaticHomePage ),
		...ownProps,
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( QuickLinks );
