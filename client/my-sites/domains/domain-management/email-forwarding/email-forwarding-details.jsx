/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import support from 'lib/url/support';

import analyticsMixin from 'lib/mixins/analytics';

const EmailForwardingDetails = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	render: function() {
		return (
		    <p className="email-forwarding__explanation">
				{ this.props.translate( 'Email Forwarding lets you use your custom domain in your email address, so your email address can be just as memorable as your blog.' ) }
				{ ' ' }
				<a href={ support.EMAIL_FORWARDING }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.handleLearnMoreClick }>
					{ this.props.translate( 'Learn more.' ) }
				</a>
			</p>
		);
	},

	handleLearnMoreClick() {
		this.recordEvent( 'learnMoreClick', this.props.selectedDomainName );
	}
} );

export default localize( EmailForwardingDetails );
