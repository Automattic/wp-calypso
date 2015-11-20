/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var cartItems = require( 'lib/cart-values' ).cartItems,
	isFreePlan = require( 'lib/products-values' ).isFreePlan,
	upgradesActions = require( 'lib/upgrades/actions' );

module.exports = React.createClass( {
	displayName: 'PlansSelect',

	getInitialState: function() {
		return { hasSelectedPlan: false };
	},

	componentDidMount: function() {
		this.props.sites.on( 'change', this.attemptToSelectPlan );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this.attemptToSelectPlan );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.attemptToSelectPlan( nextProps );
	},

	attemptToSelectPlan: function( nextProps ) {
		var props = nextProps || this.props,
			planSlug = props.plans.getSlugFromPath( this.props.context.params.plan ),
			selectedSite = props.sites.getSelectedSite(),
			product,
			cartItem;

		if ( ! props.cart.hasLoadedFromServer || ! selectedSite || this.state.hasSelectedPlan ) {
			return;
		}

		if ( ! planSlug ) {
			return page.redirect( '/plans/' + selectedSite.slug );
		}

		product = { product_slug: planSlug };
		if ( isFreePlan( product ) ) {
			return page.redirect( '/plans/' + selectedSite.slug );
		}

		cartItem = cartItems.getItemForPlan( product, { isFreeTrial: true } );
		upgradesActions.addItem( cartItem );

		this.setState( { hasSelectedPlan: true } );

		page.redirect( '/checkout/' + selectedSite.slug );
	},

	render: function() {
		return null;
	}
} );
