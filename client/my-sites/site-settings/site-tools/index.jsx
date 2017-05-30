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

		if ( ! this.props.hasLoadedSitePurchasesFromServer ) {
			return null;
		}

		return (
			<div className="site-tools">
				<SectionHeader label={ translate( 'Site Tools' ) } />
				<CompactCard
					href={ changeAddressLink }
					onClick={ this.trackChangeAddress }
					className="site-tools__link">
					<div className="site-tools__content">
						<p className="site-tools__section-title">{ changeSiteAddress }</p>
						<p className="site-tools__section-desc">{ changeAddressText }</p>
					</div>
				</CompactCard>
				{ config.isEnabled( 'settings/theme-setup' ) &&
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
				<CompactCard
					href={ startOverLink }
					onClick={ this.trackStartOver }
					className="site-tools__link">
					<div className="site-tools__content">
						<p className="site-tools__section-title">{ startOver }</p>
						<p className="site-tools__section-desc">{ startOverText }</p>
					</div>
				</CompactCard>
				<CompactCard
					href={ deleteSiteLink }
					onClick={ this.checkForSubscriptions }
					className="site-tools__link">
					<div className="site-tools__content">
						<p className="site-tools__section-title is-warning">
							{ deleteSite }
						</p>
						<p className="site-tools__section-desc">{ deleteSiteText }</p>
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
