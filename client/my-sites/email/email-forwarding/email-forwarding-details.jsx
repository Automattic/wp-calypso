/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { EMAIL_FORWARDING } from 'lib/url/support';

class EmailForwardingDetails extends React.Component {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
		trackLearnMoreClick: PropTypes.func.isRequired,
	};

	render() {
		return (
			<p className="email-forwarding__explanation">
				{ this.props.translate(
					'Email Forwarding lets you use your custom domain in your email address, so your email address can be just as memorable as your blog.'
				) }{' '}
				<a
					href={ EMAIL_FORWARDING }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ this.learnMoreClick }
				>
					{ this.props.translate( 'Learn more.' ) }
				</a>
			</p>
		);
	}

	learnMoreClick = () => {
		this.props.trackLearnMoreClick( this.props.selectedDomainName );
	};
}

const trackLearnMoreClick = domainName =>
	composeAnalytics(
		recordTracksEvent( 'calypso_domain_management_email_forwarding_learn_more_click', {
			domain_name: domainName,
		} ),
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Learn more" link in Email Forwarding',
			'Domain Name',
			domainName
		)
	);

export default connect(
	null,
	{
		trackLearnMoreClick,
	}
)( localize( EmailForwardingDetails ) );
