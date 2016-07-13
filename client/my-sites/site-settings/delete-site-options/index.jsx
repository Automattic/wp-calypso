/**
 * External dependencies
 */
import React from 'react';
import filter from 'lodash/filter';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DeleteSiteWarningDialog from 'my-sites/site-settings/delete-site-warning-dialog';
import config from 'config';
import { tracks } from 'lib/analytics';

const trackDeleteSiteOption = ( option ) => {
	tracks.recordEvent( 'calypso_settings_delete_site_options', {
		option: option
	} );
};

module.exports = React.createClass( {
	displayName: 'DeleteSite',

	propTypes: {
		sitePurchases: React.PropTypes.array.isRequired,
		hasLoadedSitePurchasesFromServer: React.PropTypes.bool.isRequired,
		site: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			showDialog: false,
			showStartOverDialog: false
		};
	},

	render() {
		const selectedSite = this.props.site;
		const changeAddressLink = `/domains/manage/${selectedSite.slug}`;
		const startOverLink = `/settings/start-over/${selectedSite.slug}`;
		const deleteSiteLink = `/settings/delete-site/${selectedSite.slug}`;
		let changeAddressLinkText = this.translate( 'Register a new domain or change your site\'s address.' );
		const strings = {
			changeSiteAddress: this.translate( 'Change Site Address' ),
			startOver: this.translate( 'Start Over' ),
			deleteSite: this.translate( 'Delete Site' )
		};

		if ( ! this.props.hasLoadedSitePurchasesFromServer ) {
			return null;
		}

		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			changeAddressLinkText = this.translate( 'Change your site\'s address.' );
		}

		return (
			<div className="delete-site-options">
				<CompactCard
					href={ changeAddressLink }
					onClick={ this.trackChangeAddress }
					className="delete-site-options__link">
					<div className="delete-site-options__content">
						<h2 className="delete-site-options__section-title">{ strings.changeSiteAddress }</h2>
						<p className="delete-site-options__section-desc">{ changeAddressLinkText }</p>
						<p className="delete-site-options__section-footnote">
							{ this.translate( 'Your current site address is "%(siteAddress)s."', {
								args: {
									siteAddress: selectedSite.slug
								}
							} ) }
						</p>
					</div>
				</CompactCard>
				<CompactCard
					href={ startOverLink }
					onClick={ this.trackStartOver }
					className="delete-site-options__link">
					<div className="delete-site-options__content">
						<h2 className="delete-site-options__section-title">{ strings.startOver }</h2>
						<p className="delete-site-options__section-desc">
							{ this.translate( 'Keep your URL and site active, but remove the content.' ) }
						</p>
					</div>
				</CompactCard>
				<CompactCard
					href={ deleteSiteLink }
					onClick={ this.checkForSubscriptions }
					className="delete-site-options__link">
					<div className="delete-site-options__content">
						<h2 className="delete-site-options__section-title">{ strings.deleteSite }</h2>
						<p className="delete-site-options__section-desc">
							{ this.translate( 'All your posts, images, data, and this site\'s address ({{siteAddress /}}) will be gone forever.', {
								components: {
									siteAddress: <strong>{ selectedSite.slug }</strong>
								}
							} ) }
						</p>
						<p className="delete-site-options__section-footnote">
							{
								this.translate( 'Be careful! Once a site is deleted, it cannot be recovered. Please be sure before you proceed.' )
							}
						</p>
					</div>
				</CompactCard>
				<DeleteSiteWarningDialog
					isVisible={ this.state.showDialog }
					onClose={ this.closeDialog } />
			</div>
		);
	},

	trackChangeAddress() {
		trackDeleteSiteOption( 'change-address' );
	},

	trackStartOver() {
		trackDeleteSiteOption( 'start-over' );
	},

	checkForSubscriptions( event ) {
		trackDeleteSiteOption( 'delete-site' );
		const activeSubscriptions = filter( this.props.sitePurchases, 'active' );

		if ( ! activeSubscriptions.length ) {
			return true;
		}

		event.preventDefault();
		this.setState( { showDialog: true } );
	},

	closeDialog() {
		this.setState( { showDialog: false } );
	}
} );
