/**
 * External dependencies
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import useUsersQuery from './use-users-query';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const withUsers = createHigherOrderComponent(
	( Wrapped, fetchOptions = {}, queryOptions = {} ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const usersQuery = useUsersQuery( siteId, fetchOptions, queryOptions );
		const users = usersQuery.data?.users ?? [];

		return <Wrapped { ...props } users={ users } />;
	},
	'WithUsers'
);

export default withUsers;
