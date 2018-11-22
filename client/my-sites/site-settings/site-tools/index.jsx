/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import DeleteSiteWarningDialog from 'my-sites/site-settings/delete-site-warning-dialog';
import config from 'config';
import { tracks } from 'lib/analytics';
import { localize } from 'i18n-calypso';
import SectionHeader from 'components/section-header';
import SiteToolsLink from './link';
import QueryRewindState from 'components/data/query-rewind-state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite, getSiteAdminUrl } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isVipSite from 'state/selectors/is-vip-site';
import getRewindState from 'state/selectors/get-rewind-state';
import { hasLoadedSitePurchasesFromServer, getPurchasesError } from 'state/purchases/selectors';
import notices from 'notices';
import hasCancelableSitePurchases from 'state/selectors/has-cancelable-site-purchases';

/**
 * Style dependencies
 */
import './style.scss';

const trackDeleteSiteOption = option => {
	tracks.recordEvent( 'calypso_settings_delete_site_options', {
		option: option,
	} );
};

class SiteTools extends Component {
	state = {
		showDialog: false,
		showStartOverDialog: false,
	};

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.purchasesError && this.props.purchasesError ) {
			notices.error( this.props.purchasesError );
		}
	}

	render() {
		const {
			translate,
			siteSlug,
			importUrl,
			exportUrl,
			cloneUrl,
			showChangeAddress,
			showClone,
			showDeleteContent,
			showDeleteSite,
			showThemeSetup,
			showManageConnection,
			siteId,
		} = this.props;

		const changeAddressLink = `/domains/manage/${ siteSlug }`;
		const themeSetupLink = `/settings/theme-setup/${ siteSlug }`;
		const startOverLink = `/settings/start-over/${ siteSlug }`;
		const deleteSiteLink = `/settings/delete-site/${ siteSlug }`;
		const manageConnectionLink = `/settings/manage-connection/${ siteSlug }`;

		const themeSetupText = translate( "Automatically make your site look like your theme's demo." );
		const changeSiteAddress = translate( 'Change your site address' );
		const themeSetup = translate( 'Theme setup' );
		const startOver = translate( 'Delete your content' );
		const startOverText = translate(
			"Keep your site's address and current theme, but remove all posts, " +
				'pages, and media so you can start fresh.'
		);
		const deleteSite = translate( 'Delete your site permanently' );
		const deleteSiteText = translate(
			"Delete all your posts, pages, media, and data, and give up your site's address."
		);
		const manageConnectionTitle = translate( 'Manage your connection' );
		const manageConnectionText = translate(
			'Sync your site content for a faster experience, change site owner, repair or terminate your connection.'
		);

		const importTitle = translate( 'Import' );
		const importText = translate(
			'Import content from another WordPress site and other platforms.'
		);
		const exportTitle = translate( 'Export' );
		const exportText = translate(
			'Export content from your site. You own your data — take it anywhere!'
		);
		const cloneTitle = translate( 'Clone', { context: 'verb' } );
		const cloneText = translate( 'Clone your existing site and all its data to a new location.' );

		let changeAddressText = translate( "Register a new domain or change your site's address." );
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			changeAddressText = translate( 'Change your site address.' );
		}

		return (
			<div className="site-tools">
				<QueryRewindState siteId={ siteId } />
				<SectionHeader label={ translate( 'Site Tools' ) } />
				{ showChangeAddress && (
					<SiteToolsLink
						href={ changeAddressLink }
						onClick={ this.trackChangeAddress }
						title={ changeSiteAddress }
						description={ changeAddressText }
					/>
				) }
				<SiteToolsLink href={ importUrl } title={ importTitle } description={ importText } />
				<SiteToolsLink href={ exportUrl } title={ exportTitle } description={ exportText } />
				{ showClone &&
					config.isEnabled( 'rewind/clone-site' ) && (
						<SiteToolsLink href={ cloneUrl } title={ cloneTitle } description={ cloneText } />
					) }
				{ showThemeSetup && (
					<SiteToolsLink
						href={ themeSetupLink }
						onClick={ this.trackThemeSetup }
						title={ themeSetup }
						description={ themeSetupText }
					/>
				) }
				{ showDeleteContent && (
					<SiteToolsLink
						href={ startOverLink }
						onClick={ this.trackStartOver }
						title={ startOver }
						description={ startOverText }
					/>
				) }
				{ showDeleteSite && (
					<SiteToolsLink
						href={ deleteSiteLink }
						onClick={ this.checkForSubscriptions }
						title={ deleteSite }
						description={ deleteSiteText }
						isWarning
					/>
				) }
				{ showManageConnection && (
					<SiteToolsLink
						href={ manageConnectionLink }
						title={ manageConnectionTitle }
						description={ manageConnectionText }
					/>
				) }
				<DeleteSiteWarningDialog isVisible={ this.state.showDialog } onClose={ this.closeDialog } />
			</div>
		);
	}

	trackChangeAddress() {
		trackDeleteSiteOption( 'change-address' );
	}

	trackThemeSetup() {
		trackDeleteSiteOption( 'theme-setup' );
	}

	trackStartOver() {
		trackDeleteSiteOption( 'start-over' );
	}

	checkForSubscriptions = event => {
		trackDeleteSiteOption( 'delete-site' );

		if ( this.props.isAtomic || ! this.props.hasCancelablePurchases ) {
			return true;
		}

		event.preventDefault();

		this.setState( { showDialog: true } );
	};

	closeDialog = () => {
		this.setState( { showDialog: false } );
	};
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const isVip = isVipSite( state, siteId );
	const rewindState = getRewindState( state, siteId );
	const sitePurchasesLoaded = hasLoadedSitePurchasesFromServer( state );

	let importUrl = `/settings/import/${ siteSlug }`;
	let exportUrl = `/settings/export/${ siteSlug }`;
	const cloneUrl = `/start/clone-site/${ siteSlug }`;
	if ( isJetpack ) {
		importUrl = getSiteAdminUrl( state, siteId, 'import.php' );
		exportUrl = getSiteAdminUrl( state, siteId, 'export.php' );
	}

	return {
		isAtomic,
		siteSlug,
		purchasesError: getPurchasesError( state ),
		importUrl,
		exportUrl,
		cloneUrl,
		showChangeAddress: ! isJetpack && ! isVip,
		showClone:
			'active' === rewindState.state && ! find( rewindState.credentials, { type: 'managed' } ),
		showThemeSetup: config.isEnabled( 'settings/theme-setup' ) && ! isJetpack && ! isVip,
		showDeleteContent: ! isJetpack && ! isVip,
		showDeleteSite: ( ! isJetpack || isAtomic ) && ! isVip && sitePurchasesLoaded,
		showManageConnection: isJetpack && ! isAtomic,
		siteId,
		hasCancelablePurchases: hasCancelableSitePurchases( state, siteId ),
	};
} )( localize( SiteTools ) );
