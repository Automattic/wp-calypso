/**
 * MySitesSidebarUnified
 *   Renders the Sidebar for "My Sites", except all of the menus and items are
 *   driven off a WPCom endpoint: /sites/${sideId}/admin-menu, which is loaded
 *   into state.adminMenu in a data layer.
 *
 *    Currently experimental/WIP.
 **/

/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentRoute } from 'state/selectors/get-current-route';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getAdminMenu } from 'state/admin-menu/selectors';
import { isUnderDomainManagementAll } from 'my-sites/domains/paths';
import { isUnderEmailManagementAll } from 'my-sites/email/paths';
import { requestAdminMenu } from '../../state/admin-menu/actions';
import CurrentSite from 'my-sites/current-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import Sidebar from 'layout/sidebar';
import SidebarSeparator from 'layout/sidebar/separator';

export const MySitesSidebarUnified = ( { path } ) => {
	const reduxDispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	useEffect( () => {
		if ( selectedSiteId !== null ) {
			reduxDispatch( requestAdminMenu( selectedSiteId ) );
		}
	}, [ reduxDispatch, selectedSiteId ] );

	// Extract this?
	const menuItems = useSelector( ( state ) => {
		const menu = getAdminMenu( state, getSelectedSiteId( state ) );
		return menu != null ? Object.values( menu ) : [];
	} );

	// Extract this?
	const isAllDomainsView = useSelector( ( state ) => {
		const currentRoute = getCurrentRoute( state );
		return isUnderDomainManagementAll( currentRoute ) || isUnderEmailManagementAll( currentRoute );
	} );

	//console.log( { menuItems } );
	return (
		<Sidebar>
			<CurrentSite forceAllSitesView={ isAllDomainsView } />
			{ menuItems.map( ( item, i ) => {
				if ( 'type' in item && item.type === 'separator' ) {
					return <SidebarSeparator key={ i } />;
				}
				if ( ! ( 'children' in item ) || item.children.length === 0 ) {
					return (
						<MySitesSidebarUnifiedItem isTopLevel key={ item.slug } path={ path } { ...item } />
					);
				}
				return <MySitesSidebarUnifiedMenu key={ item.slug } path={ path } { ...item } />;
			} ) }
		</Sidebar>
	);
};
export default MySitesSidebarUnified;
