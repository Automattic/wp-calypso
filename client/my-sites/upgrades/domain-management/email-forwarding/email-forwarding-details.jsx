/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	analyticsMixin = require( 'lib/mixins/analytics' );

var EmailForwardingDetails = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	render: function() {
		var supportLink = 'https://' + i18n.getLocaleSlug() + '.support.wordpress.com/email-forwarding/';
		return (
			<p className="email-forwarding__explanation">
				{ this.translate( 'Email Forwarding feature lets you use your custom domain in your email address, so your email address can be just as memorable as your blog.' ) }
				{ ' ' }
				<a href={ supportLink }
						target="_blank"
						onClick={ this.handleLearnMoreClick }>
					{ this.translate( 'Learn more.' ) }
				</a>
			</p>
		);
	},

	handleLearnMoreClick() {
		this.recordEvent( 'learnMoreClick', this.props.selectedDomainName );
	}
} );

module.exports = EmailForwardingDetails;

