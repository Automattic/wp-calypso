/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import { acceptTransfer, declineTransfer } from 'lib/upgrades/actions';
import notices from 'notices';
import { translate } from 'lib/mixins/i18n';

const somethingWrongMessage = translate(
	'Oops! Something went wrong and your request could not be ' +
	'processed. Please try again or {{a}}Contact Support{{/a}} if ' +
	'you continue to have trouble.',
	{
		components: {
			a: (
				<a
					href="https://support.wordpress.com/contact/"
					target="_blank" />
			)
		}
	}
);

const PendingTransfer = React.createClass( {
	getInitialState() {
		return {
			submitting: false
		}
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
			notices.error( somethingWrongMessage );

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
			notices.error( somethingWrongMessage );

			return;
		}

		notices.success(
			this.translate(
				"Glad you want to stay! We've declined the domain transfer request."
			)
		);
	},

	render() {
		return (
			<div>
				<SectionHeader label={ this.translate( 'Transfer Domain' ) } className="transfer__section-header"/>
				<Card className="transfer-card">
					<p>
						{ this.translate(
							'Your domain %(domainName)s is currently being transferred to another registrar. To speed up this ' +
							'process, accept the transfer below. {{learnMoreLink}}Learn more.{{/learnMoreLink}}',
							{
								args: {
									domainName: this.props.selectedDomainName
								},
								components: {
									learnMoreLink: <a
										href="https://support.wordpress.com/transfer-domain-registration/"
										target="_blank"/>
								}
							}
						) }
					</p>
					<Button
						primary
						className="transfer__action-button"
						onClick={ this.handleAcceptTransferClick }
						disabled={ this.state.submitting }>
						{ this.translate( 'Accept Transfer' ) }
					</Button>
					<Button
						onClick={ this.handleDeclineTransferClick }
						className="transfer__action-button"
						disabled={ this.state.submitting }>
						{ this.translate( 'Decline Transfer' ) }
					</Button>
				</Card>
			</div>
		);
	}
} );
export default PendingTransfer;
