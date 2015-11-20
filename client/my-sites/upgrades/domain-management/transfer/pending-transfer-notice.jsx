/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import notices from 'notices';
import SimpleNotice from 'notices/simple-notice';
import { acceptTransfer, declineTransfer } from 'lib/upgrades/actions';
import { getSelectedDomain } from 'lib/domains';

const PendingTransferNotice = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		wapiDomainInfo: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return { submitting: false };
	},

	render() {
		const { pendingTransfer } = this.props.wapiDomainInfo.data,
			{ transferProhibited, isPendingIcannVerification } = getSelectedDomain( this.props );

		if ( ! pendingTransfer || transferProhibited || isPendingIcannVerification ) {
			return null;
		}

		return (
			<SimpleNotice showDismiss={ false } status={ null }>
				<p>
					{ this.translate(
						'This domain may currently be pending transfer. If you have ' +
						'requested a domain transfer, you can accept or cancel the ' +
						'transfer below.'
					) }
				</p>

				<Button primary={ true }
						onClick={ this.handleAcceptTransferClick }
						disabled={ this.state.submitting }>
					{ this.translate( 'Accept Transfer' ) }
				</Button>
				{ ' ' }
				<Button onClick={ this.handleDeclineTransferClick }
						disabled={ this.state.submitting }>
					{ this.translate( 'Decline Transfer' ) }
				</Button>
			</SimpleNotice>
		);
	},

	handleAcceptTransferClick() {
		this.setState( { submitting: true } );

		acceptTransfer( this.props.selectedDomainName, ( error ) => {
			this.setState( { submitting: false } );
			this.displayAcceptTransferNotice( error );
		} );
	},

	displayAcceptTransferNotice( error ) {
		if ( error ) {
			notices.error(
				this.translate(
					'Oops! Something went wrong and your request could not be ' +
					'processed. Please try again or {{a}}Contact Support{{/a}} if ' +
					'you continue to have trouble.',
					{
						components: {
							a: (
								<a href="https://support.wordpress.com/contact/"
									target="_blank" />
							)
						}
					}
				)
			);

			return;
		}

		notices.success(
			this.translate(
				"Sorry to see you go! We've accepted the domain transfer, you " +
				'should receive an email confirming this from your new registrar ' +
				'shortly.'
			)
		);
	},

	handleDeclineTransferClick() {
		this.setState( { submitting: true } );

		declineTransfer( this.props.selectedDomainName, ( error ) => {
			this.setState( { submitting: false } );
			this.displayDeclineTransferNotice( error );
		} );
	},

	displayDeclineTransferNotice( error ) {
		if ( error ) {
			notices.error(
				this.translate(
					'Oops! Something went wrong and your request could not be ' +
					'processed. Please try again or {{a}}Contact Support{{/a}} if ' +
					'you continue to have trouble.',
					{
						components: {
							a: (
								<a href="https://support.wordpress.com/contact/"
									target="_blank" />
							)
						}
					}
				)
			);

			return;
		}

		notices.success(
			this.translate(
				"Glad you want to stay! We've declined the domain transfer request."
			)
		);
	}
} );

export default PendingTransferNotice;
