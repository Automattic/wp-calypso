/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { SharingService, connectFor } from 'my-sites/sharing/connections/service';

export class Facebook extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
	};

	static defaultProps = {
		...SharingService.defaultProps,
	};

	didKeyringConnectionSucceed( availableExternalAccounts ) {
		if ( availableExternalAccounts.length === 0 ) {
			this.props.failCreateConnection( {
				message: this.props.translate(
					'The %(service)s connection could not be made because this account does not have access to any Pages.',
					{
						args: { service: this.props.service.label },
						context: 'Sharing: Publicize connection error',
					}
				),
			} );
			this.setState( { isConnecting: false } );
			return false;
		}

		return super.didKeyringConnectionSucceed( availableExternalAccounts );
	}
}

export default connectFor( Facebook, ( state, props ) => props );
