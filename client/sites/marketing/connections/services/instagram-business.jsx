import SocialLogo from 'calypso/components/social-logo';
import { SharingService, connectFor } from '../service';

export class InstagramBusiness extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
	};

	renderLogo = () => (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<SocialLogo icon="instagram" size={ 48 } className="sharing-service__logo" />
	);

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( { availableExternalAccounts } ) {
		if ( this.state.isAwaitingConnections && ! availableExternalAccounts.length ) {
			this.props.errorNotice(
				this.props.translate(
					'No Instagram business accounts linked to your Facebook pages found.'
				),
				{ id: 'publicize' }
			);
		}

		super.UNSAFE_componentWillReceiveProps( ...arguments );
	}
}

export default connectFor( InstagramBusiness, ( state, props ) => props );
