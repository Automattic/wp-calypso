/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { EMAIL_FORWARDING } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

class EmailForwardingDetails extends React.Component {
	static propTypes = {
		translate: PropTypes.func,
		learnMoreClick: PropTypes.func,
	};

	render() {
		const { translate, learnMoreClick } = this.props;
		return (
			<p className="email-forwarding__explanation">
				{ translate(
					'Email Forwarding lets you use your custom domain in your email address, so your email address can be just as memorable as your blog.'
				) }
				<a
					href={ EMAIL_FORWARDING }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ learnMoreClick }
				>
					{ translate( 'Learn more.' ) }
				</a>
			</p>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	learnMoreClick: domainName => {
		dispatch(
			composeAnalytics(
				recordGoogleEvent(
					'Domain Management',
					'Clicked "Learn more" link in Email Forwarding',
					'Domain Name',
					domainName
				),
				recordTracksEvent( 'calypso_domain_management_email_forwarding_learn_more_click', {
					domain_name: domainName,
				} )
			)
		);
	},
} );

export default connect(
	null,
	mapDispatchToProps
)( localize( EmailForwardingDetails ) );
