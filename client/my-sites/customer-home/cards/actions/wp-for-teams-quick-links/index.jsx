/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'calypso/components/foldable-card';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	getSiteFrontPage,
	getCustomizerUrl,
	getSiteOption,
	isNewSite,
} from 'calypso/state/sites/selectors';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import isSiteUsingFullSiteEditing from 'calypso/state/selectors/is-site-using-full-site-editing';
import { getGSuiteSupportedDomains } from 'calypso/lib/gsuite';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { navigate } from 'calypso/state/ui/actions';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import ActionBox from '../quick-links/action-box';
import isHomeQuickLinksExpanded from 'calypso/state/selectors/is-home-quick-links-expanded';
import { expandHomeQuickLinks, collapseHomeQuickLinks } from 'calypso/state/home/actions';

/**
 * Style dependencies
 */
import '../quick-links/style.scss';

export const QuickLinks = ( {
	customizeUrl,
	isStaticHomePage,
	showCustomizer,
	menusUrl,
	editHomepageAction,
	writePostAction,
	addPageAction,
	manageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	isExpanded,
	expand,
	collapse,
} ) => {
	const translate = useTranslate();

	const quickLinks = (
		<div className="wp-for-teams-quick-links__boxes quick-links__boxes">
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ editHomepageAction }
					label={ translate( 'Edit homepage' ) }
					materialIcon="laptop"
				/>
			) : (
				<ActionBox
					onClick={ writePostAction }
					label={ translate( 'Write blog post' ) }
					materialIcon="edit"
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ addPageAction }
					label={ translate( 'Add a page' ) }
					materialIcon="insert_drive_file"
				/>
			) : (
				<ActionBox
					onClick={ manageCommentsAction }
					label={ translate( 'Manage comments' ) }
					materialIcon="mode_comment"
				/>
			) }
			{ isStaticHomePage ? (
				<ActionBox
					onClick={ writePostAction }
					label={ translate( 'Write blog post' ) }
					materialIcon="edit"
				/>
			) : (
				<ActionBox
					onClick={ addPageAction }
					label={ translate( 'Add a page' ) }
					materialIcon="insert_drive_file"
				/>
			) }
			{ showCustomizer && (
				<ActionBox
					href={ menusUrl }
					onClick={ trackEditMenusAction }
					label={ translate( 'Edit menus' ) }
					materialIcon="list"
				/>
			) }
			{ showCustomizer && (
				<ActionBox
					href={ customizeUrl }
					onClick={ trackCustomizeThemeAction }
					label={ translate( 'Customize theme' ) }
					materialIcon="palette"
				/>
			) }
		</div>
	);
	return (
		<FoldableCard
			className="wp-for-teams-quick-links quick-links"
			header={ translate( 'Quick Links' ) }
			clickableHeader
			expanded={ isExpanded }
			onOpen={ expand }
			onClose={ collapse }
		>
			{ quickLinks }
		</FoldableCard>
	);
};

const editHomepageAction = ( editHomePageUrl, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_edit_homepage_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_edit_homepage' )
		),
		navigate( editHomePageUrl )
	);

const writePostAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_write_post_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_write_post' )
		),
		navigate( `/post/${ siteSlug }` )
	);

const addPageAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_add_page_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_add_page' )
		),
		navigate( `/page/${ siteSlug }` )
	);

const manageCommentsAction = ( siteSlug, isStaticHomePage ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_my_site_manage_comments_click', {
				is_static_home_page: isStaticHomePage,
			} ),
			bumpStat( 'calypso_customer_home', 'my_site_manage_comments' )
		),
		navigate( `/comments/${ siteSlug }` )
	);

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
	const domains = getDomainsBySiteId( state, siteId );
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
		hasCustomDomain: getGSuiteSupportedDomains( domains ).length > 0,
		siteSlug,
		isStaticHomePage,
		editHomePageUrl,
		isExpanded: isHomeQuickLinksExpanded( state ),
	};
};

const mapDispatchToProps = {
	editHomepageAction,
	writePostAction,
	addPageAction,
	manageCommentsAction,
	trackEditMenusAction,
	trackCustomizeThemeAction,
	expand: expandHomeQuickLinks,
	collapse: collapseHomeQuickLinks,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { editHomePageUrl, isStaticHomePage, siteSlug } = stateProps;
	return {
		...stateProps,
		...dispatchProps,
		editHomepageAction: () => dispatchProps.editHomepageAction( editHomePageUrl, isStaticHomePage ),
		writePostAction: () => dispatchProps.writePostAction( siteSlug, isStaticHomePage ),
		addPageAction: () => dispatchProps.addPageAction( siteSlug, isStaticHomePage ),
		manageCommentsAction: () => dispatchProps.manageCommentsAction( siteSlug, isStaticHomePage ),
		trackEditMenusAction: () => dispatchProps.trackEditMenusAction( isStaticHomePage ),
		trackCustomizeThemeAction: () => dispatchProps.trackCustomizeThemeAction( isStaticHomePage ),
		...ownProps,
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( QuickLinks );
