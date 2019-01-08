/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { CALYPSO_CONTACT } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { deleteEmailForwarding, resendVerificationEmailForwarding } from 'lib/upgrades/actions';
import notices from 'notices';
import { successNotice } from 'state/notices/actions';

class EmailForwardingItem extends React.Component {
	deleteItem = () => {
		const { temporary, domain, mailbox, forward_address, email } = this.props.emailData;

		if ( temporary ) {
			return;
		}

		deleteEmailForwarding( domain, mailbox, error => {
			this.props.recordDeleteClick( domain, mailbox, forward_address, ! error );

			if ( error ) {
				notices.error(
					error.message ||
						this.props.translate(
							'Failed to delete email forwarding record. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
							{
								components: {
									contactSupportLink: <a href={ CALYPSO_CONTACT } />,
								},
							}
						)
				);
			} else {
				notices.success(
					this.props.translate(
						'Yay, e-mail forwarding for %(email)s has been successfully deleted.',
						{
							args: {
								email: email,
							},
						}
					),
					{
						duration: 5000,
					}
				);
			}
		} );
	};

	resendVerificationEmail = () => {
		const { domain, forward_address, mailbox, temporary } = this.props.emailData;

		if ( temporary ) {
			return;
		}

		resendVerificationEmailForwarding( domain, mailbox, ( error, response ) => {
			this.props.recordResendVerificationClick( domain, mailbox, forward_address, ! error );

			if ( error || ! response.sent ) {
				notices.error(
					this.props.translate(
						'Failed to resend verification email for email forwarding record. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
						{
							components: {
								contactSupportLink: <a href={ CALYPSO_CONTACT } />,
							},
						}
					)
				);
			} else {
				notices.success(
					this.props.translate( 'Yay, successfully sent confirmation email to %(email)s!', {
						args: {
							email: forward_address,
						},
					} ),
					{
						duration: 5000,
					}
				);
			}
		} );
	};

	render() {
		return (
			<li>
				<Button borderless disabled={ this.props.emailData.temporary } onClick={ this.deleteItem }>
					<Gridicon icon="trash" />
				</Button>

				{ ! this.props.emailData.active && (
					<Button
						disabled={ this.props.emailData.temporary }
						borderless
						onClick={ this.resendVerificationEmail }
						title={ this.props.translate( 'Resend Verification Email', {
							context: 'Email Forwarding',
						} ) }
					>
						<Gridicon icon="mail" />
					</Button>
				) }

				<span>
					{ this.props.translate(
						'{{strong1}}%(email)s{{/strong1}} {{em}}forwards to{{/em}} {{strong2}}%(forwardTo)s{{/strong2}}',
						{
							components: {
								strong1: <strong />,
								strong2: <strong />,
								em: <em />,
							},
							args: {
								email: this.props.emailData.email,
								forwardTo: this.props.emailData.forward_address,
							},
						}
					) }
				</span>
			</li>
		);
	}
}

const recordDeleteClick = ( domainName, mailbox, destination, success ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked delete Button in Email Forwarding',
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_email_forwarding_delete_click', {
			destination,
			domain_name: domainName,
			mailbox,
			success,
		} )
	);

const recordResendVerificationClick = ( domainName, mailbox, destination, success ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked resend verification email Button in Email Forwarding',
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			'calypso_domain_management_email_forwarding_resend_verification_email_click',
			{
				destination,
				domain_name: domainName,
				mailbox,
				success,
			}
		)
	);

EmailForwardingItem.propTypes = {
	recordDeleteClick: PropTypes.func.isRequired,
	emailData: PropTypes.shape( {
		domain: PropTypes.string.isRequired,
		forward_address: PropTypes.string.isRequired,
		mailbox: PropTypes.string.isRequired,
		temporary: PropTypes.bool,
	} ),
	recordResendVerificationClick: PropTypes.func.isRequired,
	successNotice: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect(
	null,
	{ recordDeleteClick, recordResendVerificationClick, successNotice }
)( localize( EmailForwardingItem ) );
