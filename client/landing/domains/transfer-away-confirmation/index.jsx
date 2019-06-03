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
// import { CALYPSO_CONTACT } from 'lib/url/support';
import { acceptTransfer, declineTransfer } from 'lib/upgrades/actions';
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
		wpcom.domainsVerifyOutbountTransferConfirmationState( domain, email, token ).then(
			() => {
				this.setState( this.getVerificationSuccessState() );
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
			title: translate( 'Verifying your contact information…' ),
			message: 'Loading…',
			actionTitle: null,
			actionCallback: null,
			footer: 'Loading…',
		};
	};

	onAcceptTransferComplete = error => {
		this.setState( { isProcessingRequest: false, error } );
	};

	acceptTransfer = () => {
		this.setState( { isProcessingRequest: true } );
		acceptTransfer( this.props.domain, this.onAcceptTransferComplete );
	};

	onCancelTransferComplete = error => {
		this.setState( { isProcessingRequest: false, error } );
	};

	declineTransfer = () => {
		this.setState( { isProcessingRequest: true } );
		declineTransfer( this.props.domain, this.onCancelTransferComplete );
	};

	getDefaultState = () => {
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
			actionTitle: 'Accept Transfer',
			actionCallback: this.acceptTransfer,
			alternateActionTitle: 'Cancel Transfer',
			alternateActionCallback: this.declineTransfer,
			isLoading: false,
		};
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="transfer-away-confirmation">
				<DomainsLandingHeader title={ translate( 'Domain Transfer Managment' ) } />
				<DomainsLandingContentCard
					title={ this.state.title }
					message={ this.state.message }
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
