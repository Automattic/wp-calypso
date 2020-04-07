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

/**
 * Style dependencies
 */
import './style.scss';

class OutboundTransferConfirmation extends React.PureComponent {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { domain, translate } = this.props;

		if ( ! domain.pendingTransfer ) {
			return null;
		}

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
					<Button primary className="outbound-transfer-confirmation__accept-transfer">
						{ translate( 'Accept transfer' ) }
					</Button>
					<Button>{ translate( 'Cancel transfer' ) }</Button>
				</p>
			</>
		);
	}
}

export default localize( OutboundTransferConfirmation );
