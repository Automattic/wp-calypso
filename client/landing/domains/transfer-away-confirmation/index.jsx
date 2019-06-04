/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DomainsLandingHeader from '../header';
import DomainsLandingContentCard from '../content-card';
import { CALYPSO_CONTACT } from 'lib/url/support';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

class TransferAwayConfirmationPage extends Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		token: PropTypes.string.isRequired,
	};

	state = {
		isLoading: false,
		isProcessingRequest: false,
		success: false,
		error: false,
	};

	constructor( props ) {
		super( props );
		this.state = this.getLoadingState();
	}

	componentWillMount() {
		const { domain, email, token } = this.props;
		wpcom.domainsVerifyOutboundTransferConfirmation( domain, email, token ).then(
			() => {
				this.setState( this.getConfirmationSelectState() );
			},
			error => {
				this.setErrorState( error );
			}
		);
	}

	getLoadingState = () => {
		const { translate } = this.props;
		return {
			isLoading: true,
			title: translate( 'Manage your Domain Transfer' ),
			message: 'Loading…',
			actionTitle: null,
			actionCallback: null,
		};
	};

	onAcceptTransferComplete = error => {
		if ( error ) {
			this.setErrorState( { error: 'accept_transfer_failed' } );
		} else {
			this.setSuccessState( 'accept_transfer_success' );
		}
	};

	acceptTransfer = () => {
		this.setState( { isProcessingRequest: true } );
		wpcom.acceptTransfer( this.props.domain, this.onAcceptTransferComplete );
	};

	onCancelTransferComplete = error => {
		if ( error ) {
			this.setErrorState( { error: 'cancel_transfer_failed' } );
		} else {
			this.setSuccessState( 'cancel_transfer_success' );
		}
	};

	cancelTransfer = () => {
		this.setState( { isProcessingRequest: true } );
		wpcom.declineTransfer( this.props.domain, this.onCancelTransferComplete );
	};

	getConfirmationSelectState = () => {
		const { domain, translate } = this.props;
		return {
			title: translate( 'Manage your Domain Transfer' ),
			message: translate(
				'You have requested to transfer {{strong}}%(domain)s{{/strong}} away from WordPress.com to another registration provider.{{br/}}{{br/}}' +
					'If you take no action, the domain transfer will process automatically within seven days of when it was started.{{br/}}{{br/}}' +
					'To cancel this transfer and keep your domain at WordPress.com, click the “Cancel Transfer” button.{{br/}}{{br/}}' +
					'To process this transfer immediately instead of waiting, click the “Accept Transfer” button.',
				{
					args: {
						domain: domain,
					},
					components: {
						strong: <strong />,
						br: <br />,
					},
				}
			),
			messageAlignCenter: false,
			actionTitle: 'Accept Transfer',
			actionCallback: this.acceptTransfer,
			alternateActionTitle: 'Cancel Transfer',
			alternateActionCallback: this.cancelTransfer,
			isLoading: false,
		};
	};

	getWhoisErrorState = () => {
		const { translate } = this.props;

		return {
			message: translate(
				"Something went wrong.{{br/}}{{br/}}We couldn't get the transfer status for your domain.{{br/}}Please try again in a few hours.",
				{
					components: {
						br: <br />,
					},
				}
			),
		};
	};

	getExpiredTokenErrorState = () => {
		const { translate } = this.props;

		return {
			message: translate(
				'This email has expired.{{br/}}{{br/}}If it has been over seven days since you have started your transfer and it has not yet completed, please {{a}}{{strong}}contact support{{/strong}}{{/a}}.',
				{
					components: {
						a: <a href={ CALYPSO_CONTACT } />,
						br: <br />,
						strong: <strong />,
					},
				}
			),
			footer: null,
		};
	};

	getNotPendingTransferErrorState = () => {
		const { translate } = this.props;

		return {
			title: translate( 'Domain not awaiting transfer.' ),
			message: translate(
				'This domain is no longer pending transfer.{{br/}}{{br/}}If your transfer has completed successfully or you previously cancelled your domain transfer, there is nothing else you need to do.',
				{
					components: {
						br: <br />,
					},
				}
			),
		};
	};

	getDefaultErrorState = () => {
		const { translate } = this.props;
		const defaultErrorFooter = translate(
			"If you're having trouble managing your domain transfer, please {{a}}{{strong}}contact support{{/strong}}{{/a}}.",
			{
				components: {
					a: <a href={ CALYPSO_CONTACT } />,
					strong: <strong />,
				},
			}
		);

		return {
			title: translate( 'Uh oh!' ),
			message: translate( 'Hmm. Something went wrong.' ),
			messageAlignCenter: true,
			actionTitle: null,
			actionCallback: null,
			alternateActionTitle: null,
			alternateActionCallback: null,
			footer: defaultErrorFooter,
			isLoading: false,
			isProcessingRequest: false,
		};
	};

	setErrorState = error => {
		let errorState;

		switch ( error.error ) {
			case 'email_mismatch':
				errorState = this.getEmailMismatchState();
				break;

			case 'token_expired':
				errorState = this.getExpiredTokenErrorState();
				break;

			case 'whois_status_error':
				errorState = this.getWhoisErrorState();
				break;

			case 'no_pending_transfer':
				errorState = this.getNotPendingTransferErrorState();
				break;
		}

		this.setState( {
			...this.getDefaultErrorState(),
			...errorState,
		} );
	};

	getAcceptTransferSuccessState = () => {
		const { translate } = this.props;

		return {
			message: translate(
				'Congratulations!{{br/}}{{br/}}You have successfully expedited your domain transfer. There is nothing else you need to do.',
				{
					components: {
						br: <br />,
					},
				}
			),
		};
	};

	getCancelTransferSuccessState = () => {
		const { translate } = this.props;

		return {
			message: translate(
				'Congratulations!{{br/}}{{br/}}You have successfully cancelled your domain transfer. There is nothing else you need to do.',
				{
					components: {
						br: <br />,
					},
				}
			),
		};
	};

	getDefaultSuccessState = () => {
		const { translate } = this.props;

		return {
			title: translate( 'Success!' ),
			messageAlignCenter: true,
			actionTitle: null,
			actionCallback: null,
			alternateActionTitle: null,
			alternateActionCallback: null,
			footer: null,
			isLoading: false,
			isProcessingRequest: false,
		};
	};

	setSuccessState = success => {
		let successState;

		switch ( success ) {
			case 'accept_transfer_success':
				successState = this.getAcceptTransferSuccessState();
				break;

			case 'cancel_transfer_success':
				successState = this.getCancelTransferSuccessState();
				break;
		}

		this.setState( {
			...this.getDefaultSuccessState(),
			...successState,
		} );
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="transfer-away-confirmation">
				<DomainsLandingHeader title={ translate( 'Domain Transfer Management' ) } />
				<DomainsLandingContentCard
					title={ this.state.title }
					message={ this.state.message }
					messageAlignCenter={ this.state.messageAlignCenter }
					actionTitle={ this.state.actionTitle }
					actionCallback={ this.state.actionCallback }
					actionPrimary={ false }
					actionBusy={ this.state.isProcessingRequest }
					alternateActionTitle={ this.state.alternateActionTitle }
					alternateActionCallback={ this.state.alternateActionCallback }
					alternateActionPrimary={ false }
					alternateActionBusy={ this.state.isProcessingRequest }
					footer={ this.state.footer }
					isLoading={ this.state.isLoading }
				/>
			</div>
		);
	}
}

export default localize( TransferAwayConfirmationPage );
