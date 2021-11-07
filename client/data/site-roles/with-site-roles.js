import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useSiteRolesQuery from './use-site-roles-query';

const withSiteRoles = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const { data } = useSiteRolesQuery( siteId );

		return <Wrapped { ...props } siteRoles={ data ?? [] } />;
	},
	'WithSiteRoles'
);

export default withSiteRoles;
