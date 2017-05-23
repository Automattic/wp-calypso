/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DeleteSiteWarningDialog from 'my-sites/site-settings/delete-site-warning-dialog';
import config from 'config';
import { tracks } from 'lib/analytics';
import { localize } from 'i18n-calypso';
import SectionHeader from 'components/section-header';

const trackDeleteSiteOption = ( option ) => {
	tracks.recordEvent( 'calypso_settings_delete_site_options', {
		option: option
	} );
};

class SiteTools extends Component {
	static propTypes = {
		sitePurchases: PropTypes.array.isRequired,
		hasLoadedSitePurchasesFromServer: PropTypes.bool.isRequired,
		site: PropTypes.object.isRequired
	}

	state = {
		showDialog: false,
		showStartOverDialog: false,
	}

	render() {
		const { translate } = this.props;

		const selectedSite = this.props.site;
		const changeAddressLink = `/domains/manage/${ selectedSite.slug }`;
		const themeSetupLink = `/settings/theme-setup/${ selectedSite.slug }`;
		const startOverLink = `/settings/start-over/${ selectedSite.slug }`;
		const deleteSiteLink = `/settings/delete-site/${ selectedSite.slug }`;
		let changeAddressLinkText = translate( 'Register a new domain or change your site\'s address.' );
		const themeSetupLinkText = translate( 'Automatically make your site look like your theme\'s demo.' );
		const strings = {
			changeSiteAddress: translate( 'Change your site address' ),
			themeSetup: translate( 'Theme setup' ),
			startOver: translate( 'Delete your content' ),
			deleteSite: translate( 'Delete your site permanently' )
		};

		if ( ! this.props.hasLoadedSitePurchasesFromServer ) {
			return null;
		}

		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			changeAddressLinkText = translate( 'Change your site address.' );
		}

		return (
			<div className="delete-site-options">
				<SectionHeader label={ translate( 'Site Tools' ) } />
				<CompactCard
					href={ changeAddressLink }
					onClick={ this.trackChangeAddress }
					className="delete-site-options__link">
					<div className="delete-site-options__content">
						<p className="delete-site-options__section-title">{ strings.changeSiteAddress }</p>
						<p className="delete-site-options__section-desc">{ changeAddressLinkText }</p>
					</div>
				</CompactCard>
				{ config.isEnabled( 'settings/theme-setup' ) &&
					<CompactCard
						href={ themeSetupLink }
						onClick={ this.trackThemeSetup }
						className="delete-site-options__link">
						<div className="delete-site-options__content">
							<p className="delete-site-options__section-title">{ strings.themeSetup }</p>
							<p className="delete-site-options__section-desc">{ themeSetupLinkText }</p>
						</div>
					</CompactCard>
				}
				<CompactCard
					href={ startOverLink }
					onClick={ this.trackStartOver }
					className="delete-site-options__link">
					<div className="delete-site-options__content">
						<p className="delete-site-options__section-title">{ strings.startOver }</p>
						<p className="delete-site-options__section-desc">
							{ translate(
								'Keep your site\'s address and current theme, but remove all posts, ' +
								'pages, and media so you can start fresh.'
							) }
						</p>
					</div>
				</CompactCard>
				<CompactCard
					href={ deleteSiteLink }
					onClick={ this.checkForSubscriptions }
					className="delete-site-options__link">
					<div className="delete-site-options__content">
						<p className="delete-site-options__section-title is-warning">
							{ strings.deleteSite }
						</p>
						<p className="delete-site-options__section-desc">
							{ translate(
								'Delete all your posts, pages, media and data, ' +
								'and give up your site\'s address'
							) }
						</p>
					</div>
				</CompactCard>
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

export default localize( SiteTools );
