import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import withP2HubP2Count from 'calypso/data/p2/with-p2-hub-p2-count';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DeleteSiteWarningDialog from 'calypso/my-sites/site-settings/delete-site-warning-dialog';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	hasLoadedSitePurchasesFromServer,
	getPurchasesError,
} from 'calypso/state/purchases/selectors';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import hasCancelableSitePurchases from 'calypso/state/selectors/has-cancelable-site-purchases';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite, isJetpackProductSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import SiteToolsLink from './link';

import './style.scss';

const trackDeleteSiteOption = ( option ) => {
	recordTracksEvent( 'calypso_settings_delete_site_options', {
		option: option,
	} );
};

class SiteTools extends Component {
	state = {
		showDialog: false,
	};

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.purchasesError && this.props.purchasesError ) {
			this.props.errorNotice( this.props.purchasesError );
		}
	}

	render() {
		const {
			translate,
			siteSlug,
			cloneUrl,
			showChangeAddress,
			showClone,
			showDeleteContent,
			showDeleteSite,
			showManageConnection,
			siteId,
		} = this.props;

		const changeAddressLink = `/domains/manage/${ siteSlug }`;
		const startOverLink = `/settings/start-over/${ siteSlug }`;
		const deleteSiteLink = `/settings/delete-site/${ siteSlug }`;
		const manageConnectionLink = `/settings/manage-connection/${ siteSlug }`;

		const changeSiteAddress = translate( 'Change your site address' );
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

		const cloneTitle = translate( 'Clone', { context: 'verb' } );
		const cloneText = translate( 'Clone your existing site and all its data to a new location.' );

		return (
			<div className="site-tools">
				<QueryRewindState siteId={ siteId } />
				<SettingsSectionHeader id="site-tools__header" title={ translate( 'Site tools' ) } />
				{ showChangeAddress && (
					<SiteToolsLink
						href={ changeAddressLink }
						onClick={ this.trackChangeAddress }
						title={ changeSiteAddress }
						description={ translate( "Register a new domain or change your site's address." ) }
					/>
				) }
				{ showClone && (
					<SiteToolsLink href={ cloneUrl } title={ cloneTitle } description={ cloneText } />
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
				<DeleteSiteWarningDialog
					isVisible={ this.state.showDialog }
					p2HubP2Count={ this.props?.p2HubP2Count }
					onClose={ this.closeDialog }
				/>
			</div>
		);
	}

	trackChangeAddress() {
		trackDeleteSiteOption( 'change-address' );
	}

	trackStartOver() {
		trackDeleteSiteOption( 'start-over' );
	}

	checkForSubscriptions = ( event ) => {
		trackDeleteSiteOption( 'delete-site' );
		const { isAtomic, hasCancelablePurchases, p2HubP2Count } = this.props;

		if ( isAtomic || ( ! hasCancelablePurchases && ! p2HubP2Count ) ) {
			return true;
		}

		event.preventDefault();

		this.setState( { showDialog: true } );
	};

	closeDialog = () => {
		this.setState( { showDialog: false } );
	};
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );
		const isAtomic = isSiteAutomatedTransfer( state, siteId );
		const isJetpack = isJetpackSite( state, siteId ) || isJetpackProductSite( state, siteId );
		const isVip = isVipSite( state, siteId );
		const isP2 = isSiteWPForTeams( state, siteId );
		const isP2Hub = isSiteP2Hub( state, siteId );
		const rewindState = getRewindState( state, siteId );
		const sitePurchasesLoaded = hasLoadedSitePurchasesFromServer( state );

		const cloneUrl = `/start/clone-site/${ siteSlug }`;

		return {
			isAtomic,
			siteSlug,
			purchasesError: getPurchasesError( state ),
			cloneUrl,
			showChangeAddress: ! isJetpack && ! isVip && ! isP2,
			showClone: 'active' === rewindState.state && ! isAtomic,
			showDeleteContent: ( ! isJetpack || isAtomic ) && ! isVip && ! isP2Hub,
			showDeleteSite: ( ! isJetpack || isAtomic ) && ! isVip && sitePurchasesLoaded,
			showManageConnection: isJetpack && ! isAtomic,
			siteId,
			hasCancelablePurchases: hasCancelableSitePurchases( state, siteId ),
		};
	},
	{
		errorNotice,
	}
)( localize( withP2HubP2Count( SiteTools ) ) );
