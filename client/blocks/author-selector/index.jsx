/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SwitcherShell from './switcher-shell';
import useUsersQuery from 'calypso/data/users/use-users-query';

/**
 * Style dependencies
 */
import './style.scss';

const AuthorSelector = ( { siteId, exclude, ...rest } ) => {
	const [ search, setSearch ] = React.useState( '' );

	const fetchOptions = { number: 50 };

	if ( search ) {
		fetchOptions.number = 20; // make search a little faster
		fetchOptions.search = `*${ search.trim() }*`;
		fetchOptions.search_columns = [ 'user_login', 'display_name' ];
	}

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useUsersQuery(
		siteId,
		fetchOptions
	);

	const users =
		data?.users.filter( ( user ) => {
			if ( typeof exclude === 'function' ) {
				return ! exclude( user );
			}
			if ( Array.isArray( exclude ) ) {
				return ! exclude.includes( user.ID );
			}
			return true;
		} ) ?? [];
	const listKey = [ 'followers', siteId, search ].join( '-' );

	return (
		<SwitcherShell
			users={ users }
			totalUsers={ data?.total }
			siteId={ siteId }
			search={ search }
			updateSearch={ setSearch }
			fetchNextPage={ fetchNextPage }
			hasNextPage={ hasNextPage }
			isLoading={ isLoading }
			isFetchingNextPage={ isFetchingNextPage }
			listKey={ listKey }
			{ ...rest }
		/>
	);
};

AuthorSelector.propTypes = {
	siteId: PropTypes.number.isRequired,
	onSelect: PropTypes.func,
	exclude: PropTypes.oneOfType( [ PropTypes.arrayOf( PropTypes.number ), PropTypes.func ] ),
	allowSingleUser: PropTypes.bool,
	popoverPosition: PropTypes.string,
	transformAuthor: PropTypes.func,
};

AuthorSelector.defaultProps = {
	showAuthorMenu: false,
	onClose: function () {},
	allowSingleUser: false,
	popoverPosition: 'bottom left',
};

export default AuthorSelector;
