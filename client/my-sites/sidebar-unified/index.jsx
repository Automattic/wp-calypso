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
import { getSelectedSite } from 'state/ui/selectors';
import { isUnderDomainManagementAll } from 'my-sites/domains/paths';
import { isUnderEmailManagementAll } from 'my-sites/email/paths';
import { requestAdminMenu } from '../../state/admin-menu/actions';
import CurrentSite from 'my-sites/current-site';
import MySitesSidebarUnifiedItem from './item';
import MySitesSidebarUnifiedMenu from './menu';
import Sidebar from 'layout/sidebar';
import SidebarSeparator from 'layout/sidebar/separator';
import SidebarMenu from 'layout/sidebar/menu';

export const MySitesSidebarUnified = ( { path } ) => {
	const reduxDispatch = useDispatch();
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	useEffect( () => {
		if ( selectedSite !== null && selectedSite.ID ) {
			reduxDispatch( requestAdminMenu( selectedSite.ID ) );
		}
	}, [ reduxDispatch, selectedSite ] );

	// Extract this?
	const menuItems = useSelector( ( state ) => {
		const thisSelectedSite = getSelectedSite( state );
		if (
			thisSelectedSite !== null &&
			thisSelectedSite.ID &&
			state.adminMenu != null &&
			thisSelectedSite.ID in state.adminMenu
		) {
			return Object.values( state.adminMenu[ thisSelectedSite.ID ] );
		}
		return [];
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
						<SidebarMenu key={ item.slug }>
							<MySitesSidebarUnifiedItem key={ `${ item.slug }-item` } path={ path } { ...item } />
						</SidebarMenu>
					);
				}
				return <MySitesSidebarUnifiedMenu key={ item.slug } path={ path } { ...item } />;
			} ) }
		</Sidebar>
	);
};
export default MySitesSidebarUnified;
