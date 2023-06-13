import { SharingService, connectFor } from 'calypso/my-sites/marketing/connections/service';

export class Mastodon extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		isNew: true,
	};
}

export default connectFor( Mastodon, ( state, props ) => props );
