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

const AuthorSelector = ( {
	allowSingleUser = false,
	children,
	exclude,
	ignoreContext,
	onSelect,
	popoverPosition = 'bottom left',
	siteId,
	transformAuthor,
} ) => {
	const [ search, setSearch ] = React.useState( '' );
	const [ prevSiteId, setPrevSiteId ] = React.useState( null );

	if ( siteId && siteId !== prevSiteId ) {
		setPrevSiteId( siteId );
		if ( search !== '' ) {
			setSearch( '' );
		}
	}

	const fetchOptions = { number: 50 };
	const trimmedSearch = search.trim?.();

	if ( trimmedSearch ) {
		fetchOptions.number = 20; // make search a little faster
		fetchOptions.search = `*${ trimmedSearch }*`;
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
	const listKey = [ 'authors', siteId, search ].join( '-' );

	return (
		<SwitcherShell
			allowSingleUser={ allowSingleUser }
			fetchNextPage={ fetchNextPage }
			hasNextPage={ hasNextPage }
			ignoreContext={ ignoreContext }
			isFetchingNextPage={ isFetchingNextPage }
			isLoading={ isLoading }
			listKey={ listKey }
			onSelect={ onSelect }
			popoverPosition={ popoverPosition }
			search={ search }
			siteId={ siteId }
			transformAuthor={ transformAuthor }
			updateSearch={ setSearch }
			users={ users }
		>
			{ children }
		</SwitcherShell>
	);
};

AuthorSelector.propTypes = {
	allowSingleUser: PropTypes.bool,
	exclude: PropTypes.oneOfType( [ PropTypes.arrayOf( PropTypes.number ), PropTypes.func ] ),
	onSelect: PropTypes.func,
	popoverPosition: PropTypes.string,
	siteId: PropTypes.number.isRequired,
	transformAuthor: PropTypes.func,
};

export default AuthorSelector;
