/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import DeleteSiteWarningDialog from 'client/my-sites/site-settings/delete-site-warning-dialog';
import config from 'config';
import { tracks } from 'client/lib/analytics';
import { localize } from 'i18n-calypso';
import SectionHeader from 'client/components/section-header';
import SiteToolsLink from './link';
import { getSelectedSiteId, getSelectedSiteSlug } from 'client/state/ui/selectors';
import { isJetpackSite, getSiteAdminUrl } from 'client/state/sites/selectors';
import { isSiteAutomatedTransfer, isVipSite } from 'client/state/selectors';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	getPurchasesError,
} from 'client/state/purchases/selectors';
import notices from 'client/notices';

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

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.purchasesError ) {
			notices.error( nextProps.purchasesError );
		}
	}

	render() {
		const {
			translate,
			siteSlug,
			importUrl,
			exportUrl,
			showChangeAddress,
			showDeleteContent,
			showDeleteSite,
			showThemeSetup,
			showManageConnection,
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
		const importText = translate( 'Import content from another WordPress or Medium site.' );
		const exportTitle = translate( 'Export' );
		const exportText = translate(
			'Export content from your site. You own your data — take it anywhere!'
		);

		let changeAddressText = translate( "Register a new domain or change your site's address." );
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			changeAddressText = translate( 'Change your site address.' );
		}

		return (
			<div className="site-tools">
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

		if ( this.props.isAtomic || ! some( this.props.sitePurchases, 'active' ) ) {
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
	const sitePurchasesLoaded = hasLoadedSitePurchasesFromServer( state );

	let importUrl = `/settings/import/${ siteSlug }`;
	let exportUrl = `/settings/export/${ siteSlug }`;
	if ( isJetpack ) {
		importUrl = getSiteAdminUrl( state, siteId, 'import.php' );
		exportUrl = getSiteAdminUrl( state, siteId, 'export.php' );
	}

	return {
		isAtomic,
		siteSlug,
		sitePurchases: getSitePurchases( state, siteId ),
		purchasesError: getPurchasesError( state ),
		importUrl,
		exportUrl,
		showChangeAddress: ! isJetpack && ! isVip,
		showThemeSetup: config.isEnabled( 'settings/theme-setup' ) && ! isJetpack && ! isVip,
		showDeleteContent: ! isJetpack && ! isVip,
		showDeleteSite: ( ! isJetpack || isAtomic ) && ! isVip && sitePurchasesLoaded,
		showManageConnection: isJetpack && ! isAtomic,
	};
} )( localize( SiteTools ) );
