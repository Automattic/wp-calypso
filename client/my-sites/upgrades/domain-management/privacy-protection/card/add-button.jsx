/**
 * External dependencies
 */
const page = require( 'page' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
const cartItems = require( 'lib/cart-values' ).cartItems,
	config = require( 'config' ),
	upgradesActions = require( 'lib/upgrades/actions' );

const AddButton = React.createClass( {
	propTypes: {
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	render() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		return (
			<button
				type="button"
				className="button is-primary"
				onClick={ this.addPrivacyProtection }>
				{ this.translate( 'Add Privacy Protection' ) }
			</button>
		);
	},

	addPrivacyProtection() {
		upgradesActions.addItem( cartItems.domainPrivacyProtection( { domain: this.props.selectedDomainName } ) );

		page( '/checkout/' + this.props.selectedSite.slug );
	}
} );

module.exports = AddButton;
