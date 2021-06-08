/**
 * External dependencies
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import useSiteRolesQuery from './use-site-roles-query';

const withSiteRoles = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { data } = useSiteRolesQuery( props.siteId );

		return <Wrapped { ...props } siteRoles={ data ?? [] } />;
	},
	'WithSiteRoles'
);

export default withSiteRoles;
