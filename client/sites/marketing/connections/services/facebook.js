import { localizeUrl } from '@automattic/i18n-utils';
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
				<>
					{ this.props.translate(
						'The Facebook connection could not be made because this account does not have access to any Pages.',
						{
							context: 'Sharing: Jetpack Social connection error',
						}
					) }{ ' ' }
					{ this.props.translate(
						'Facebook supports Jetpack Social connections to Facebook Pages, but not to Facebook Profiles. ' +
							'{{a}}Learn More about Jetpack Social for Facebook{{/a}}',
						{
							components: {
								a: (
									<a
										href={ localizeUrl( 'https://wordpress.com/support/post-to-facebook/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</>,
				{ id: 'publicize' }
			);
			this.setState( { isConnecting: false } );
			return false;
		}

		return super.didKeyringConnectionSucceed( availableExternalAccounts );
	}
}

export default connectFor( Facebook, ( state, props ) => props );
