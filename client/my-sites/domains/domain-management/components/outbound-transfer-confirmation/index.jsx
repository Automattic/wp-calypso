/**
 * External dependencies
 *
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import {
	acceptDomainTransfer,
	cancelDomainTransferRequest,
} from 'calypso/state/domains/transfer/actions';
import { getMaintenanceMessageFromError } from '../../../../../landing/domains/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getDomainWapiInfoByDomainName } from 'calypso/state/domains/transfer/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class OutboundTransferConfirmation extends React.PureComponent {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
	};

	isRequesting = () => {
		return this.props.isAccepting || this.props.isCanceling;
	};

	onAcceptTransferClick = () => {
		const { domain } = this.props;
		this.props.acceptDomainTransfer( domain.name );
		this.props.recordTracksEvent( 'calypso_outbound_transfer_accept_click' );
	};

	onCancelTransferClick = () => {
		const { domain, siteId } = this.props;
		this.props.cancelDomainTransferRequest( {
			domainName: domain.name,
			siteId: siteId,
			declineTransfer: true,
		} );
		this.props.recordTracksEvent( 'calypso_outbound_transfer_cancel_click' );
	};

	getErrorMessage( error ) {
		const { translate } = this.props;

		switch ( error.error ) {
			case 'no_pending_transfer':
				return translate(
					'This domain is no longer awaiting transfer. If your transfer has completed successfully or ' +
						'you previously cancelled your domain transfer, there is nothing else you need to do.'
				);
			case 'domain_registration_unavailable':
			case 'tld-in-maintenance':
				return getMaintenanceMessageFromError( error, translate );
			default:
				return error.message;
		}
	}

	renderAcceptButton() {
		return (
			<Button
				primary
				busy={ this.props.isAccepting }
				disabled={ this.isRequesting() }
				className="outbound-transfer-confirmation__accept-transfer"
				onClick={ this.onAcceptTransferClick }
			>
				{ this.props.translate( 'Accept transfer' ) }
			</Button>
		);
	}

	renderCancelButton() {
		return (
			<Button
				busy={ this.props.isCanceling }
				disabled={ this.isRequesting() }
				onClick={ this.onCancelTransferClick }
			>
				{ this.props.translate( 'Cancel transfer' ) }
			</Button>
		);
	}

	renderWithCancelButtonOnly() {
		const { domain, translate } = this.props;

		if ( domain.currentUserCanManage ) {
			return (
				<>
					<p>
						{ translate(
							'We received a notification that you would like to transfer this domain to another registrar. ' +
								'You can cancel the transfer if you want to keep your domain with ' +
								'WordPress.com. If you take no action, the transfer will automatically process 7 days ' +
								'from when it was started at your new provider.'
						) }
					</p>

					<p>{ this.renderCancelButton() }</p>
				</>
			);
		}

		return (
			<>
				<p>
					{ translate(
						'We received a notification that you would like to transfer this domain to another registrar. ' +
							'Please contact the owner, %(owner)s, if you want to cancel it. ' +
							'If you take no action, the transfer will automatically process 7 days from when it was ' +
							'started at your new provider.',
						{
							args: {
								owner: domain.owner,
							},
						}
					) }
				</p>
			</>
		);
	}

	renderWithAcceptButton() {
		const { domain, translate } = this.props;
		if ( domain.currentUserCanManage ) {
			return (
				<>
					<p>
						{ translate(
							'We received a notification that you would like to transfer this domain to another registrar. ' +
								'Accept the transfer to complete the process or cancel it to keep your domain with ' +
								'WordPress.com. If you take no action, the transfer will automatically process 7 days ' +
								'from when it was started at your new provider.'
						) }
					</p>

					<p>
						{ this.renderAcceptButton() }
						{ this.renderCancelButton() }
					</p>
				</>
			);
		}

		return (
			<>
				<p>
					{ translate(
						'We received a notification that you would like to transfer this domain to another registrar. ' +
							'Please contact the owner, %(owner)s, to complete the process or cancel it. ' +
							'If you take no action, the transfer will automatically process 7 days from when it was ' +
							'started at your new provider.',
						{
							args: {
								owner: domain.owner,
							},
						}
					) }
				</p>
			</>
		);
	}

	render() {
		const { domain } = this.props;

		if ( ! domain.pendingTransfer ) {
			return null;
		}

		if ( domain.supportsTransferApproval ) {
			return this.renderWithAcceptButton();
		}

		return this.renderWithCancelButtonOnly();
	}
}

export default connect(
	( state, { domain } ) => {
		const domainInfo = getDomainWapiInfoByDomainName( state, domain );

		return {
			isAccepting: !! domainInfo.isAcceptingTransfer,
			isCanceling: !! domainInfo.isCancelingTransfer,
		};
	},
	{
		acceptDomainTransfer,
		cancelDomainTransferRequest,
		recordTracksEvent,
	}
)( localize( OutboundTransferConfirmation ) );
