import SocialLogo from 'calypso/components/social-logo';
import { SharingService, connectFor } from 'calypso/my-sites/marketing/connections/service';

export class InstagramBusiness extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		isNew: true,
	};

	renderLogo = () => (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<SocialLogo icon="instagram" size={ 48 } className="sharing-service__logo" />
	);
}

export default connectFor( InstagramBusiness, ( state, props ) => props );
