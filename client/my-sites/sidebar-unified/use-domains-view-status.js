/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentRoute } from 'state/selectors/get-current-route';
import { isUnderDomainManagementAll } from 'my-sites/domains/paths';
import { isUnderEmailManagementAll } from 'my-sites/email/paths';

const useDomainsViewStatus = () =>
	useSelector( ( state ) => {
		const currentRoute = getCurrentRoute( state );
		return isUnderDomainManagementAll( currentRoute ) || isUnderEmailManagementAll( currentRoute );
	} );

export default useDomainsViewStatus;
