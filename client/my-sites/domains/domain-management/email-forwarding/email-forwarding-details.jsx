/** @format */
/**
 * External dependencies
 */
var React = require( 'react' );

var createReactClass = require( 'create-react-class' );

/**
 * Internal dependencies
 */
var support = require( 'lib/url/support' ),
	analyticsMixin = require( 'lib/mixins/analytics' );

var EmailForwardingDetails = createReactClass( {
	displayName: 'EmailForwardingDetails',
	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	render: function() {
		return (
			<p className="email-forwarding__explanation">
				{ this.props.translate(
					'Email Forwarding lets you use your custom domain in your email address, so your email address can be just as memorable as your blog.'
				) }{' '}
				<a
					href={ support.EMAIL_FORWARDING }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ this.handleLearnMoreClick }
				>
					{ this.props.translate( 'Learn more.' ) }
				</a>
			</p>
		);
	},

	handleLearnMoreClick() {
		this.recordEvent( 'learnMoreClick', this.props.selectedDomainName );
	},
} );

module.exports = localize( EmailForwardingDetails );
