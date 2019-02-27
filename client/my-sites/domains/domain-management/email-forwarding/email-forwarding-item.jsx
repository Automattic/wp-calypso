/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { CALYPSO_CONTACT } from 'lib/url/support';
import Button from 'components/button';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { resendVerificationEmailForwarding } from 'lib/upgrades/actions';
import { removeEmailForwarding } from 'state/email-forwarding/actions';
import notices from 'state/notices/actions';

class EmailForwardingItem extends React.Component {
	deleteItem = () => {
		const { temporary, domain, mailbox, forward_address } = this.props.emailData;

		if ( temporary ) {
			return;
		}

		this.props.removeEmailForwarding( domain, mailbox );
		this.props.recordDeleteClick( domain, mailbox, forward_address );
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

const recordDeleteClick = ( domainName, mailbox, destination ) =>
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
	translate: PropTypes.func.isRequired,
};

export default connect(
	null,
	dispatch => {
		return bindActionCreators(
			{
				removeEmailForwarding,
				recordDeleteClick,
				recordResendVerificationClick,
			},
			dispatch
		);
	}
)( localize( EmailForwardingItem ) );
