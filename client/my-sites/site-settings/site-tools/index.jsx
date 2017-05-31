/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty, pickBy, some } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DeleteSiteWarningDialog from 'my-sites/site-settings/delete-site-warning-dialog';
import config from 'config';
import { tracks } from 'lib/analytics';
import { localize } from 'i18n-calypso';
import SectionHeader from 'components/section-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isVipSite } from 'state/selectors';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	getPurchasesError,
} from 'state/purchases/selectors';
import notices from 'notices';

const trackDeleteSiteOption = ( option ) => {
	tracks.recordEvent( 'calypso_settings_delete_site_options', {
		option: option
	} );
};

class SiteTools extends Component {
	state = {
		showDialog: false,
		showStartOverDialog: false,
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.purchasesError ) {
			notices.error( nextProps.purchasesError );
		}
	}

	render() {
		const {
			translate,
			sitePurchasesLoaded,
			siteSlug,
			isJetpack,
			isVip,
		} = this.props;

		const showSection = {
			changeAddress: ! isJetpack && ! isVip,
			themeSetup: config.isEnabled( 'settings/theme-setup' ) && ! isJetpack && ! isVip,
			deleteContent: ! isJetpack && ! isVip,
			deleteSite: ! isJetpack && ! isVip && sitePurchasesLoaded,
		};

		if ( isEmpty( pickBy( showSection ) ) ) {
			return null;
		}

		const changeAddressLink = `/domains/manage/${ siteSlug }`;
		const themeSetupLink = `/settings/theme-setup/${ siteSlug }`;
		const startOverLink = `/settings/start-over/${ siteSlug }`;
		const deleteSiteLink = `/settings/delete-site/${ siteSlug }`;

		const themeSetupText = translate( 'Automatically make your site look like your theme\'s demo.' );
		const changeSiteAddress = translate( 'Change your site address' );
		const themeSetup = translate( 'Theme setup' );
		const startOver = translate( 'Delete your content' );
		const startOverText = translate(
			'Keep your site\'s address and current theme, but remove all posts, ' +
			'pages, and media so you can start fresh.'
		);
		const deleteSite = translate( 'Delete your site permanently' );
		const deleteSiteText = translate(
			'Delete all your posts, pages, media and data, ' +
			'and give up your site\'s address'
		);

		let changeAddressText = translate( 'Register a new domain or change your site\'s address.' );
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			changeAddressText = translate( 'Change your site address.' );
		}

		return (
			<div className="site-tools">
				<SectionHeader label={ translate( 'Site Tools' ) } />
				{ showSection.changeAddress &&
					<CompactCard
						href={ changeAddressLink }
						onClick={ this.trackChangeAddress }
						className="site-tools__link">
						<div className="site-tools__content">
							<p className="site-tools__section-title">{ changeSiteAddress }</p>
							<p className="site-tools__section-desc">{ changeAddressText }</p>
						</div>
					</CompactCard>
				}
				{ showSection.themeSetup &&
					<CompactCard
						href={ themeSetupLink }
						onClick={ this.trackThemeSetup }
						className="site-tools__link">
						<div className="site-tools__content">
							<p className="site-tools__section-title">{ themeSetup }</p>
							<p className="site-tools__section-desc">{ themeSetupText }</p>
						</div>
					</CompactCard>
				}
				{ showSection.deleteContent &&
					<CompactCard
						href={ startOverLink }
						onClick={ this.trackStartOver }
						className="site-tools__link">
						<div className="site-tools__content">
							<p className="site-tools__section-title">{ startOver }</p>
							<p className="site-tools__section-desc">{ startOverText }</p>
						</div>
					</CompactCard>
				}
				{ showSection.deleteSite &&
					<CompactCard
						href={ deleteSiteLink }
						onClick={ this.checkForSubscriptions }
						className="site-tools__link">
						<div className="site-tools__content">
							<p className="site-tools__section-title is-warning">{ deleteSite }</p>
							<p className="site-tools__section-desc">{ deleteSiteText }</p>
						</div>
					</CompactCard>
				}
				<DeleteSiteWarningDialog
					isVisible={ this.state.showDialog }
					onClose={ this.closeDialog } />
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

	checkForSubscriptions = ( event ) => {
		trackDeleteSiteOption( 'delete-site' );

		if ( ! some( this.props.sitePurchases, 'active' ) ) {
			return true;
		}

		event.preventDefault();
		this.setState( { showDialog: true } );
	}

	closeDialog = () => {
		this.setState( { showDialog: false } );
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			siteSlug: getSelectedSiteSlug( state ),
			isJetpack: isJetpackSite( state, siteId ),
			isVip: isVipSite( state, siteId ),
			sitePurchasesLoaded: hasLoadedSitePurchasesFromServer( state ),
			sitePurchases: getSitePurchases( state, siteId ),
			purchasesError: getPurchasesError( state ),
		};
	}
)( localize( SiteTools ) );
