/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

export default function isRequestingReaderOrganizations( state ) {
	return !! state.reader.organizations.isRequesting;
}
