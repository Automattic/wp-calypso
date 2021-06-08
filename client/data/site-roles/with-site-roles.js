/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import useSiteRolesQuery from './use-site-roles-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const withSiteRoles = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const { data } = useSiteRolesQuery( siteId );

		return <Wrapped { ...props } siteRoles={ data ?? [] } />;
	},
	'WithSiteRoles'
);

export default withSiteRoles;
