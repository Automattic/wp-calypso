/**
 * External dependencies
 *
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import EmailVerificationCard from 'my-sites/domains/domain-management/components/email-verification';
import { checkInboundTransferStatus, resendInboundTransferEmail } from 'lib/domains';
import support from 'lib/url/support';
import Card from 'components/card';

class InboundTransferEmailVerificationCard extends React.Component {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		email: '',
		loading: true,
		manualWhois: false,
	};

	componentWillMount() {
		this.refreshContactEmail();
	}

	componentWillUpdate( nextProps ) {
		if ( nextProps.selectedDomainName !== this.props.selectedDomainName ) {
			this.refreshContactEmail();
		}
	}

	refreshContactEmail = () => {
		this.setState( { loading: true } );

		checkInboundTransferStatus( this.props.selectedDomainName, ( error, result ) => {
			if ( ! isEmpty( error ) ) {
				return;
			}

			this.setState( {
				contactEmail: result.admin_email,
				manualWhois: result.manual_whois,
				loading: false,
			} );
		} );
	};

	render() {
		const { selectedDomainName, selectedSiteSlug, translate } = this.props;
		const { loading, manualWhois, contactEmail } = this.state;

		if ( loading ) {
			return null;
		}

		if ( manualWhois || ! contactEmail ) {
			return (
				<Card highlight="warning">
					<div>
						<h1 className="inbound-transfer-verification__heading">
							{ translate(
								'The authorization email is still waiting to be sent.'
							) }
						</h1>
						{ translate(
							'The contact address for this domain wasn\'t immediately available. ' +
							'We will keep checking and send the email to initiate the transfer once we have the ' +
							'correct address. This could take up to 24 hours. We appreciate your patience.'
						) }
					</div>
				</Card>
			);
		}

		return (
			<EmailVerificationCard
				contactEmail={ contactEmail }
				headerText={
					translate(
						'Important: Confirm the transfer to proceed.'
					)
				}
				verificationExplanation={ translate(
					'We sent an email to confirm the transfer of {{strong}}%(domain)s{{/strong}}. ' +
					'Open the email, click the link, and enter your domain authorization code to start the process. ' +
					'Please confirm in 5 days or the transfer will be canceled. ' +
						'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
					{
						args: {
							domain: selectedDomainName,
						},
						components: {
							learnMoreLink: (
								<a
									href={ support.INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
							strong: <strong />,
						},
					}
				) }
				resendVerification={ resendInboundTransferEmail }
				selectedDomainName={ selectedDomainName }
				selectedSiteSlug={ selectedSiteSlug }
			/>
		);
	}
}

export default localize( InboundTransferEmailVerificationCard );
