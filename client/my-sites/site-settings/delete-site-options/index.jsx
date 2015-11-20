/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' ),
	filter = require( 'lodash/collection/filter' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' ),
	PurchasesStore = require( 'lib/purchases/store' ),
	UpgradesActions = require( 'lib/upgrades/actions' ),
	pollers = require( 'lib/data-poller' ),
	notices = require( 'notices' ),
	config = require( 'config' ),
	Dialog = require( 'components/dialog' );

module.exports = React.createClass( {
	displayName: 'DeleteSite',

	propTypes: {
		site: React.PropTypes.object.isRequired
	},

	getInitialState: function() {
		return {
			showStartOverDialog: false,
			sitePurchases: PurchasesStore.getBySite( this.props.site.ID ).data
		};
	},

	componentWillMount: function() {
		debug( 'Mounting DeleteSite React component.' );
	},

	componentDidMount: function() {
		PurchasesStore.on( 'change', this._updatesitePurchases );
		this._poller = pollers.add( PurchasesStore, UpgradesActions.fetchSitePurchases.bind( UpgradesActions, this.props.site.ID ), { interval: 60000, leading: true } );
	},

	componentWillUnmount: function() {
		pollers.remove( this._poller );
		PurchasesStore.off( 'change', this._updatesitePurchases );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.site.ID !== this.props.site.ID ) {
			pollers.remove( this._poller );
			this._poller = pollers.add( PurchasesStore, UpgradesActions.fetchSitePurchases.bind( UpgradesActions, nextProps.site.ID ), { interval: 60000, leading: true } );
			this._updatesitePurchases( nextProps.site.ID );
		}
	},

	render: function() {
		var selectedSite = this.props.site,
			changeAddressLink = '/domains/manage/' + selectedSite.slug,
			startOverLink = '/settings/start-over/' + selectedSite.slug,
			deleteSiteLink = '/settings/delete-site/' + selectedSite.slug,
			changeAddressLinkExternal = false,
			changeAddressLinkText = this.translate( 'Register a new domain or change your site\'s address.' ),
			strings, dialogButtons;

		strings = {
			changeSiteAddress: this.translate( 'Change Site Address' ),
			startOver: this.translate( 'Start Over' ),
			deleteSite: this.translate( 'Delete Site' )
		};

		if ( typeof this.state.sitePurchases === 'undefined' ) {
			return null;
		}

		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			changeAddressLink = `https://${ selectedSite.domain }/wp-admin/index.php?page=my-blogs#blog_row_${ selectedSite.ID }`;
			changeAddressLinkExternal = true;
			changeAddressLinkText = this.translate( 'Change your site\'s address.' );
		}

		dialogButtons = [
			{ action: 'dismiss', label: this.translate( 'Dismiss' ) },
			<a className="button is-primary" href={ 'https://wordpress.com/my-upgrades' }>{
				this.translate( 'Manage Upgrades', { context: 'button label' } )
			}</a>
		];

		return (
			<div className="delete-site-options">
				<CompactCard href={ changeAddressLink } className="delete-site-options__link" target={ changeAddressLinkExternal ? '_blank' : null }>
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
				<CompactCard href={ deleteSiteLink } onClick={ this._checkForSubscriptions } className="delete-site-options__link">
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
				<Dialog isVisible={ this.state.showDialog } buttons={ dialogButtons } onClose={ this._onDialogClose } className="delete-site-options__dialog">
					<h1>{ this.translate( 'Premium Upgrades' ) }</h1>
					<p>{ this.translate( 'You have active premium upgrades on your site. Please cancel your upgrades prior to deleting your site.' ) }</p>
				</Dialog>
			</div>
		);
	},

	_updatesitePurchases: function( siteId = this.props.site.ID ) {
		if ( PurchasesStore.get().error ) {
			notices.error( PurchasesStore.get().error );
		}

		this.setState( {
			sitePurchases: PurchasesStore.getBySite( siteId ).data
		} );
	},

	_checkForSubscriptions: function( event ) {
		var activeSubscriptions = filter( this.state.sitePurchases, 'active' );
		if ( ! activeSubscriptions.length ) {
			return true;
		}
		event.preventDefault();
		this.setState( {
			showDialog: true
		} );
	},

	_onDialogClose: function() {
		this.setState( {
			showDialog: false
		} );
	}
} );
