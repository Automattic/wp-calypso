/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'TermsOfService',

	recordTermsAndConditionsClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Terms and Conditions Link' );
	},

	termsCopy: function() {
		var message = this.translate(
			'By checking out, you agree to our {{link}}fascinating terms and conditions{{/link}}.', {
			components: {
				link: <a href="//wordpress.com/tos/" target="_blank" />
			}
		} );

		// Need to add check for subscription products in the cart so we don't show this for one-off purchases like themes
		if ( true ) {
			message =  this.translate(
				'By checking out, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{purchasesLink}}how your subscription works{{/purchasesLink}} and {{cancelLink}}how to cancel{{/cancelLink}}.', {
				components: {
					tosLink: <a href="//wordpress.com/tos/" target="_blank" />,
					cancelLink: <a href="//en.support.wordpress.com/auto-renewal/" target="_blank" />,
					purchasesLink: <a href="//en.support.wordpress.com/manage-purchases/" target="_blank" />
				}
			} );
		}

		return message;
	},

	render: function() {
		return (
			<div className="checkout-terms" onClick={ this.recordTermsAndConditionsClick }>
				<Gridicon icon="info-outline" size={ 18 } />
				<p>{ this.termsCopy() }</p>
			</div>
		);
	}
} );
