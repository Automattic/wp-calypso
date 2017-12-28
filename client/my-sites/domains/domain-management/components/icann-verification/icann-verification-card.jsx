/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import support from 'client/lib/url/support';
import upgradesActions from 'client/lib/upgrades/actions';
import { errorNotice } from 'client/state/notices/actions';
import { domainManagementEditContactInfo } from 'client/my-sites/domains/paths';
import { getRegistrantWhois } from 'client/state/selectors';
import QueryWhois from 'client/components/data/query-whois';
import EmailVerificationCard from 'client/my-sites/domains/domain-management/components/email-verification';

class IcannVerificationCard extends React.Component {
	static propTypes = {
		contactDetails: PropTypes.object,
		explanationContext: PropTypes.string,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	getExplanation() {
		const { translate, explanationContext } = this.props;
		if ( explanationContext === 'name-servers' ) {
			return translate(
				'You have to verify the email address used to register this domain before you ' +
					'are able to update the name servers for your domain. ' +
					'Look for the verification message in your email inbox.'
			);
		}

		return translate(
			'We need to check your contact information to make sure you can be reached. Please verify your ' +
				'details using the email we sent you, or your domain will stop working. ' +
				'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
			{
				components: {
					learnMoreLink: (
						<a
							href={ support.EMAIL_VALIDATION_AND_VERIFICATION }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		);
	}

	render() {
		const { contactDetails, selectedDomainName, selectedSiteSlug, translate } = this.props;
		const changeEmailHref = domainManagementEditContactInfo( selectedSiteSlug, selectedDomainName );
		const verificationExplanation = this.getExplanation();

		if ( ! contactDetails ) {
			return <QueryWhois domain={ selectedDomainName } />;
		}

		return (
			<EmailVerificationCard
				changeEmailHref={ changeEmailHref }
				contactEmail={ contactDetails.email }
				headerText={ translate( 'Important: Verify Your Email Address' ) }
				verificationExplanation={ verificationExplanation }
				resendVerification={ upgradesActions.resendIcannVerification }
				selectedDomainName={ selectedDomainName }
				selectedSiteSlug={ selectedSiteSlug }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		contactDetails: getRegistrantWhois( state, ownProps.selectedDomainName ),
	} ),
	{ errorNotice }
)( localize( IcannVerificationCard ) );
