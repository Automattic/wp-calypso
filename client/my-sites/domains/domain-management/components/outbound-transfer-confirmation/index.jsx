/**
 * External dependencies
 *
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { acceptTransfer, cancelTransferRequest } from 'lib/domains/wapi-domain-info/actions';
import notices from 'notices';
import { getMaintenanceMessageFromError } from '../../../../../landing/domains/utils';

/**
 * Style dependencies
 */
import './style.scss';

class OutboundTransferConfirmation extends React.PureComponent {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this._isMounted = false;
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	setStateIfMounted( ...args ) {
		if ( this._isMounted ) {
			this.setState( ...args );
		}
	}

	state = {
		isCanceling: false,
		isAccepting: false,
	};

	isRequesting = () => {
		return this.state.isAccepting || this.state.isCanceling;
	};

	onAcceptTransferClick = () => {
		const { domain, translate } = this.props;
		this.setState( { isAccepting: true } );
		acceptTransfer( domain.name, error => {
			this.setStateIfMounted( { isAccepting: false } );
			if ( error ) {
				notices.error( this.getErrorMessage( error ) );
			} else {
				notices.success(
					translate(
						'You have successfully expedited your domain transfer. There is nothing else you need to do.'
					)
				);
			}
		} );
	};

	onCancelTransferClick = () => {
		const { domain, siteId, translate } = this.props;
		this.setState( { isCanceling: true } );
		cancelTransferRequest(
			{
				domainName: domain.name,
				siteId: siteId,
				declineTransfer: true,
			},
			error => {
				this.setStateIfMounted( { isCanceling: false } );
				if ( error ) {
					notices.error( this.getErrorMessage( error ) );
				} else {
					notices.success(
						translate(
							'You have successfully cancelled your domain transfer. There is nothing else you need to do.'
						)
					);
				}
			}
		);
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

	render() {
		const { domain, translate } = this.props;

		if ( ! domain.pendingTransfer ) {
			return null;
		}

		if ( domain.currentUserCanManage ) {
			return (
				<>
					<p>
						{ translate(
							'We received a notification that you would like to transfer this domain to another registrar. ' +
								'Accept the transfer to complete the process or cancel it to keep your domain with ' +
								'WordPress.com.'
						) }
					</p>

					<p>
						<Button
							primary
							busy={ this.state.isAccepting }
							disabled={ this.isRequesting() }
							className="outbound-transfer-confirmation__accept-transfer"
							onClick={ this.onAcceptTransferClick }
						>
							{ translate( 'Accept transfer' ) }
						</Button>
						<Button
							busy={ this.state.isCanceling }
							disabled={ this.isRequesting() }
							onClick={ this.onCancelTransferClick }
						>
							{ translate( 'Cancel transfer' ) }
						</Button>
					</p>
				</>
			);
		}

		return (
			<>
				<p>
					{ translate(
						'We received a notification that you would like to transfer this domain to another registrar. ' +
							'Please contact the owner, %(owner)s, to complete the process or cancel it.',
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
}

export default localize( OutboundTransferConfirmation );
