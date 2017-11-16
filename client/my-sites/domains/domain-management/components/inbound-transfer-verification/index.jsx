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

class InboundTransferEmailVerificationCard extends React.Component {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		email: '',
		loading: true,
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
				loading: false,
			} );
		} );
	};

	render() {
		const { selectedDomainName, selectedSiteSlug, translate } = this.props;
		const { loading, contactEmail } = this.state;

		if ( loading ) {
			return null;
		}

		return (
			<EmailVerificationCard
				contactEmail={ contactEmail }
				verificationExplanation={ translate(
					'We need to check your contact information to make sure you can be reached. Please verify your ' +
						'details using the email we sent you to begin transferring the domain to WordPress.com. ' +
						'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
					{
						components: {
							learnMoreLink: (
								<a
									href="http://support.wordpress.com"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
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
