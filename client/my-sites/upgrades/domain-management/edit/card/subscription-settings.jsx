/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
import purchasesPaths from 'me/purchases/paths';

const SubscriptionSettings = React.createClass( {
	propTypes: {
		onClick: React.PropTypes.func.isRequired
	},

	render() {
		return (
			<a className="domain-details-card__subscription-settings-button button"
				href={ purchasesPaths.list() }
				onClick={ this.props.onClick }>
				{ this.translate( 'Payment Settings' ) }
			</a>
		);
	}
} );

module.exports = SubscriptionSettings;
