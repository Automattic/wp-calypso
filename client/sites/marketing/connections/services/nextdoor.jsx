import { SharingService, connectFor } from '../service';

export class Nextdoor extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
	};
}

export default connectFor( Nextdoor, ( state, props ) => props );
