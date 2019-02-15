/** @format */

/**
 * External dependencies
 */

import React from 'react';

import createReactClass from 'create-react-class';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { EMAIL_FORWARDING } from 'lib/url/support';
import analyticsMixin from 'lib/mixins/analytics';

const EmailForwardingDetails = createReactClass( {
	displayName: 'EmailForwardingDetails',
	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	render: function() {
		return (
			<p className="email-forwarding__explanation">
				{ this.props.translate(
					'Email Forwarding lets you use your custom domain in your email address, so your email address can be just as memorable as your blog.'
				) }{' '}
				<a
					href={ EMAIL_FORWARDING }
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

export default localize( EmailForwardingDetails );
