/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import SwitcherShell from './switcher-shell';
import useUsers from 'calypso/data/users/use-users';

/**
 * Style dependencies
 */
import './style.scss';

function AuthorSelector( props ) {
	const [ search, setSearch ] = React.useState( '' );
	const { siteId, exclude } = props;

	const fetchOptions = {
		siteId: siteId,
		order: 'ASC',
		order_by: 'display_name',
		number: 50,
	};

	if ( search ) {
		fetchOptions.number = 20; // make search a little faster
		fetchOptions.search = `*${ trim( search ) }*`;
		fetchOptions.search_columns = [ 'user_login', 'display_name' ];
	}

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useUsers(
		fetchOptions
	);

	const users = data?.users.filter( ( user ) => ! exclude.includes( user.ID ) ) ?? [];

	return (
		<SwitcherShell
			{ ...props }
			fetchOptions={ fetchOptions }
			updateSearch={ setSearch }
			users={ users }
			fetchNextPage={ fetchNextPage }
			fetchingUsers={ isLoading }
			fetchingNextPage={ isFetchingNextPage }
			hasNextPage={ hasNextPage }
		/>
	);
}

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
	exclude: [],
};

export default localize( AuthorSelector );
