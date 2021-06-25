/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import { isUnderEmailManagementAll } from 'calypso/my-sites/email/paths';

const useDomainsViewStatus = () =>
	useSelector( ( state ) => {
		const currentRoute = getCurrentRoute( state );
		return isUnderDomainManagementAll( currentRoute ) || isUnderEmailManagementAll( currentRoute );
	} );

export default useDomainsViewStatus;
