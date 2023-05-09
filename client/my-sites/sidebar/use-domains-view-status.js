import { useSelector } from 'react-redux';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import { isUnderEmailManagementAll } from 'calypso/my-sites/email/paths';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';

const useDomainsViewStatus = () =>
	useSelector( ( state ) => {
		const currentRoute = getCurrentRoute( state );
		return isUnderDomainManagementAll( currentRoute ) || isUnderEmailManagementAll( currentRoute );
	} );

export default useDomainsViewStatus;
