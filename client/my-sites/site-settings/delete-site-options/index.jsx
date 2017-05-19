/**
 * External dependencies
 */
import React from 'react';
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

class SiteTools extends React.Component {

	static propTypes = {
		sitePurchases: React.PropTypes.array.isRequired,
		hasLoadedSitePurchasesFromServer: React.PropTypes.bool.isRequired,
		site: React.PropTypes.object.isRequired
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
		const themeSetupLinkText = translate( 'Make your site look like your theme\'s demo.' );
		const strings = {
			changeSiteAddress: translate( 'Change Site Address' ),
			themeSetup: translate( 'Theme Setup' ),
			startOver: translate( 'Start Over' ),
			deleteSite: translate( 'Delete Site' )
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
							{ translate( 'Keep your URL and site active, but remove the content.' ) }
						</p>
					</div>
				</CompactCard>
				<CompactCard
					href={ deleteSiteLink }
					onClick={ this.checkForSubscriptions }
					className="delete-site-options__link">
					<div className="delete-site-options__content">
						<p className="delete-site-options__section-title">{ strings.deleteSite }</p>
						<p className="delete-site-options__section-desc">
							{ translate(
								'All your posts, images, and data will be deleted. ' +
								'And this site’s address will be lost.'
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
