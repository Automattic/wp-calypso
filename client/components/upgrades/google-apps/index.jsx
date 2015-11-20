/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var cartItems = require( 'lib/cart-values' ).cartItems,
	GoogleAppsDialog = require( './dialog' ),
	HeaderCake = require( 'components/header-cake' ),
	observe = require( 'lib/mixins/data-observe' );

var GoogleApps = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	propTypes: {
		sites: React.PropTypes.object,
		cart: React.PropTypes.object,
		domain: React.PropTypes.string.isRequired,
		onGoBack: React.PropTypes.func.isRequired,
		productsList: React.PropTypes.object.isRequired,
		onAddGoogleApps: React.PropTypes.func.isRequired,
		onClickSkip: React.PropTypes.func.isRequired,
		onSave: React.PropTypes.func,
		initialState: React.PropTypes.object,
		analyticsSection: React.PropTypes.string,
		initialGoogleAppsCartItem: React.PropTypes.object
	},

	getDefaultProps: function() {
		return { analyticsSection: 'domains' };
	},

	componentDidMount: function() {
		this.checkDomainInCart();
	},

	componentDidUpdate: function() {
		this.checkDomainInCart();
	},

	checkDomainInCart: function() {
		if ( ! this.props.cart || ! this.props.cart.hasLoadedFromServer ) {
			return;
		}

		if ( ! cartItems.hasDomainInCart( this.props.cart, this.props.domain ) ) {
			// Should we handle this more gracefully?
			this.props.onGoBack();
		}
	},

	render: function() {
		var selectedSite = this.props.sites ? this.props.sites.getSelectedSite() : null;
		return (
			<div>
				<HeaderCake onClick={ this.props.onGoBack }>
					{ this.translate( 'Register %(domain)s', { args: { domain: this.props.domain } } ) }
				</HeaderCake>

				<GoogleAppsDialog
					domain={ this.props.domain }
					productsList={ this.props.productsList }
					onClickSkip={ this.props.onClickSkip }
					onGoBack={ this.props.onGoBack }
					onAddGoogleApps={ this.props.onAddGoogleApps }
					selectedSite={ selectedSite }
					analyticsSection={ this.props.analyticsSection }
					onSave={ this.props.onSave }
					initialState={ this.props.initialState }
					initialGoogleAppsCartItem={ this.props.initialGoogleAppsCartItem } />
			</div>
		);
	}
} );

module.exports = GoogleApps;
