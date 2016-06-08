/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var support = require( 'lib/url/support' ),
	analyticsMixin = require( 'lib/mixins/analytics' );

var EmailForwardingDetails = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	render: function() {
		return (
			<p className="email-forwarding__explanation">
				{ this.translate( 'Email Forwarding lets you use your custom domain in your email address, so your email address can be just as memorable as your blog.' ) }
				{ ' ' }
				<a href={ support.EMAIL_FORWARDING }
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

