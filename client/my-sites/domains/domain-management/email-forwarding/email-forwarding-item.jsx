/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Button from 'components/button';
import notices from 'notices';
import { successNotice } from 'state/notices/actions';
import support from 'lib/url/support';
import * as upgradesActions from 'lib/upgrades/actions';

const EmailForwardingItem = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'emailForwarding' ) ],

	deleteItem: function() {
		const { temporary, domain, mailbox, forward_address, email } = this.props.emailData;

		if ( temporary ) {
			return;
		}

		upgradesActions.deleteEmailForwarding( domain, mailbox, ( error ) => {
			this.recordEvent( 'deleteClick', domain, mailbox, forward_address, ! error );

			if ( error ) {
				notices.error( error.message || this.translate( 'Failed to delete email forwarding record. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
					{
						components: {
							contactSupportLink: <a href={ support.CALYPSO_CONTACT }/>
						}
					} )
				);
			} else {
				notices.success(
					this.translate( 'Yay, e-mail forwarding for %(email)s has been successfully deleted.', {
						args: {
							email: email
						}
					} ), {
						duration: 5000
					} );
			}
		} );
	},

	resendVerificationEmail: function() {
		const { temporary, domain, mailbox, forward_address } = this.props.emailData;

		if ( temporary ) {
			return;
		}

		upgradesActions.resendVerificationEmailForwarding( domain, mailbox, ( error, response ) => {
			this.recordEvent( 'resendVerificationClick', domain, mailbox, forward_address, ! error );

			if ( error || ! response.sent ) {
				notices.error( this.translate( 'Failed to resend verification email for email forwarding record. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
					{
						components: {
							contactSupportLink: <a href={ support.CALYPSO_CONTACT }/>
						}
					} )
				);
			} else {
				notices.success(
					this.translate( 'Yay, successfully sent confirmation email to %(email)s!', {
						args: {
							email: forward_address
						}
					} ), {
						duration: 5000
					} );
			}
		} );
	},

	render: function() {
		return (
			<li>
				<Button borderless disabled={ this.props.emailData.temporary } onClick={ this.deleteItem }>
					<Gridicon icon="trash" />
				</Button>

				{ ! this.props.emailData.active && <Button disabled={ this.props.emailData.temporary } borderless onClick={ this.resendVerificationEmail } title={ this.translate( 'Resend Verification Email', { context: 'Email Forwarding' } ) }><Gridicon icon="mail" /></Button> }

				<span>{ this.translate( '{{strong1}}%(email)s{{/strong1}} {{em}}forwards to{{/em}} {{strong2}}%(forwardTo)s{{/strong2}}',
					{
						components: {
							strong1: <strong />,
							strong2: <strong />,
							em: <em />
						},
						args: {
							email: this.props.emailData.email,
							forwardTo: this.props.emailData.forward_address
						}
					} ) }</span>
			</li>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( EmailForwardingItem );

