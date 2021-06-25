/**
 * External dependencies
 */
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import {
	removeEmailForward,
	resendVerificationEmail,
} from 'calypso/state/email-forwarding/actions';

class EmailForwardingItem extends React.Component {
	static propTypes = {
		emailData: PropTypes.shape( {
			domain: PropTypes.string.isRequired,
			forward_address: PropTypes.string.isRequired,
			mailbox: PropTypes.string.isRequired,
			temporary: PropTypes.bool,
		} ),
		removeEmailForwardWithAnalytics: PropTypes.func.isRequired,
		resendVerificationEmailWithAnalytics: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	removeEmailForwardClick = () => {
		const { temporary, domain, mailbox, forward_address: destination } = this.props.emailData;

		if ( temporary ) {
			return;
		}

		this.props.removeEmailForwardWithAnalytics( domain, mailbox, destination );
	};

	resendVerificationEmailClick = () => {
		const { domain, forward_address: destination, mailbox, temporary } = this.props.emailData;

		if ( temporary ) {
			return;
		}

		this.props.resendVerificationEmailWithAnalytics( domain, mailbox, destination );
	};

	render() {
		const { emailData, translate } = this.props;
		const { active, temporary, email, forward_address: destination } = emailData;

		return (
			<li>
				<Button borderless disabled={ temporary } onClick={ this.removeEmailForwardClick }>
					<Gridicon icon="trash" />
				</Button>

				{ ! active && (
					<Button
						disabled={ temporary }
						borderless
						onClick={ this.resendVerificationEmailClick }
						title={ translate( 'Resend Verification Email', {
							context: 'Email Forwarding',
						} ) }
					>
						<Gridicon icon="mail" />
					</Button>
				) }

				<span>
					{ translate(
						'{{strong1}}%(email)s{{/strong1}} {{em}}forwards to{{/em}} {{strong2}}%(forwardTo)s{{/strong2}}',
						{
							components: {
								strong1: <strong />,
								strong2: <strong />,
								em: <em />,
							},
							args: {
								email: email,
								forwardTo: destination,
							},
						}
					) }
				</span>
			</li>
		);
	}
}

const removeEmailForwardWithAnalytics = ( domainName, mailbox, destination ) =>
	withAnalytics(
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
		),
		removeEmailForward( domainName, mailbox )
	);

const resendVerificationEmailWithAnalytics = ( domainName, mailbox, destination ) =>
	withAnalytics(
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
				}
			)
		),
		resendVerificationEmail( domainName, mailbox, destination )
	);

export default connect( null, {
	removeEmailForwardWithAnalytics,
	resendVerificationEmailWithAnalytics,
} )( localize( EmailForwardingItem ) );
