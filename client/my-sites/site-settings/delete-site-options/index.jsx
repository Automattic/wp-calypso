/**
 * External dependencies
 */
var React = require( 'react' ),
	filter = require( 'lodash/filter' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' ),
	purchasesPaths = require( 'me/purchases/paths' ),
	PurchasesStore = require( 'lib/purchases/store' ),
	notices = require( 'notices' ),
	config = require( 'config' ),
	Dialog = require( 'components/dialog' );

module.exports = React.createClass( {
	displayName: 'DeleteSite',

	propTypes: {
		purchases: React.PropTypes.object.isRequired,
		site: React.PropTypes.object.isRequired
	},

	getInitialState: function() {
		return {
			showStartOverDialog: false,
			sitePurchases: PurchasesStore.getBySite( this.props.site.ID )
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.purchases.error ) {
			notices.error( nextProps.purchases.error );
		}
	},

	render: function() {
		var selectedSite = this.props.site,
			changeAddressLink = '/domains/manage/' + selectedSite.slug,
			startOverLink = '/settings/start-over/' + selectedSite.slug,
			deleteSiteLink = '/settings/delete-site/' + selectedSite.slug,
			changeAddressLinkText = this.translate( 'Register a new domain or change your site\'s address.' ),
			strings, dialogButtons;

		strings = {
			changeSiteAddress: this.translate( 'Change Site Address' ),
			startOver: this.translate( 'Start Over' ),
			deleteSite: this.translate( 'Delete Site' )
		};

		if ( this.props.purchases.isFetching ) {
			return null;
		}

		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			changeAddressLinkText = this.translate( 'Change your site\'s address.' );
		}

		dialogButtons = [
			{ action: 'dismiss', label: this.translate( 'Dismiss' ) },
			<a className="button is-primary" href={ purchasesPaths.list() }>{
				this.translate( 'Manage Purchases', { context: 'button label' } )
			}</a>
		];

		return (
			<div className="delete-site-options">
				<CompactCard href={ changeAddressLink } className="delete-site-options__link">
					<div className="delete-site-options__content">
						<h2 className="delete-site-options__section-title">{ strings.changeSiteAddress }</h2>
						<p className="delete-site-options__section-desc">{ changeAddressLinkText }</p>
						<p className="delete-site-options__section-footnote">{ this.translate( 'Your current site address is "%(siteAddress)s."', {
							args: {
								siteAddress: selectedSite.slug
							}
						} ) }</p>
					</div>
				</CompactCard>
				<CompactCard href={ startOverLink } className="delete-site-options__link">
					<div className="delete-site-options__content">
						<h2 className="delete-site-options__section-title">{ strings.startOver }</h2>
						<p className="delete-site-options__section-desc">{ this.translate( 'Keep your URL and site active, but remove the content.' ) }</p>
					</div>
				</CompactCard>
				<CompactCard href={ deleteSiteLink } onClick={ this.checkForSubscriptions } className="delete-site-options__link">
					<div className="delete-site-options__content">
						<h2 className="delete-site-options__section-title">{ strings.deleteSite }</h2>
						<p className="delete-site-options__section-desc">{ this.translate( 'All your posts, images, data, and this site\'s address ({{siteAddress /}}) will be gone forever.', {
							components: {
								siteAddress: <strong>{ selectedSite.slug }</strong>
							}
						} ) }</p>
						<p className="delete-site-options__section-footnote">{
							this.translate( 'Be careful! Once a site is deleted, it cannot be recovered. Please be sure before you proceed.' )
						}</p>
					</div>
				</CompactCard>
				<Dialog isVisible={ this.state.showDialog } buttons={ dialogButtons } onClose={ this.closeDialog } className="delete-site-options__dialog">
					<h1>{ this.translate( 'Premium Upgrades' ) }</h1>
					<p>{ this.translate( 'You have active premium upgrades on your site. Please cancel your upgrades prior to deleting your site.' ) }</p>
				</Dialog>
			</div>
		);
	},

	checkForSubscriptions: function( event ) {
		var activeSubscriptions = filter( this.props.purchases.data, 'active' );

		if ( ! activeSubscriptions.length ) {
			return true;
		}

		event.preventDefault();
		this.setState( { showDialog: true } );
	},

	closeDialog: function() {
		this.setState( { showDialog: false } );
	}
} );
