import { SharingService, connectFor } from '../service';

export class Facebook extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
	};

	static defaultProps = {
		...SharingService.defaultProps,
	};

	didKeyringConnectionSucceed( availableExternalAccounts ) {
		if ( availableExternalAccounts.length === 0 ) {
			this.props.warningNotice(
				this.props.translate(
					'The Facebook connection could not be made because this account does not have access to any Pages.',
					{
						context: 'Sharing: Jetpack Social connection error',
					}
				),
				{ id: 'publicize' }
			);
			this.setState( { isConnecting: false } );
			return false;
		}

		return super.didKeyringConnectionSucceed( availableExternalAccounts );
	}
}

export default connectFor( Facebook, ( state, props ) => props );
