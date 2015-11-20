/**
 * External dependencies
 */
const React = require( 'react' );

const SubscriptionSettings = React.createClass( {
	propTypes: {
		onClick: React.PropTypes.func.isRequired
	},

	render() {
		return (
			<a className="domain-details-card__subscription-settings-button button"
				href="/my-upgrades"
				target="_blank"
				onClick={ this.props.onClick }>
				{ this.translate( 'Payment Settings' ) }
			</a>
		);
	}
} );

module.exports = SubscriptionSettings;
