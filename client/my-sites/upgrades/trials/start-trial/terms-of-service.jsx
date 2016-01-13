/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'TermsOfService',

	recordTermsAndConditionsClick: function() {
		analytics.ga.recordEvent( 'Tree Trials', 'Clicked Terms and Conditions Link' );
	},

	render: function() {
		return (
			<p className="checkout-terms" onClick={ this.recordTermsAndConditionsClick }>
				{
					this.translate( 'By continuing, you agree to our {{link}}fascinating terms and conditions{{/link}}.', {
						components: {
							link: <a href="//wordpress.com/tos/" target="_blank" />
						}
					} )
				}
			</p>
		);
	}
} );
