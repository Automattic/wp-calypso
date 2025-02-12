import { Gridicon, ExternalLink } from '@automattic/components';
import { useSendInvites } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { NextButton, Title, SubTitle } from '@automattic/onboarding';
import { Button, CheckboxControl, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { Fragment, useEffect, useState } from '@wordpress/element';
import { check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Pagination from 'calypso/components/pagination';
import Search from 'calypso/components/search';
import useExternalContributorsQuery from 'calypso/data/external-contributors/use-external-contributors';
import useP2GuestsQuery from 'calypso/data/p2/use-p2-guests-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import ImportedUserItem from './imported-user-item';
import { getRole, getRoleFilterValues } from './utils';
import type { UsersQuery, Member, SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	site: SiteDetails;
	onSubmit: () => void;
}

// Used to modify the way the pagination number list is displayed
const getPageList = ( page: number, pageCount: number ) => {
	const firstPage: number = 1;
	const lastPage = pageCount;
	let pageList: ( string | number )[] = [
		firstPage,
		page - 2,
		page - 1,
		page,
		page + 1,
		page + 2,
		lastPage,
	];
	pageList.sort( ( a, b ) => Number( a ) - Number( b ) );

	// Remove pages less than 1, or greater than total number of pages, and remove duplicates
	pageList = pageList.filter( ( pageNumber, index, originalPageList ) => {
		const currentPageNumber = Number( pageNumber );
		return (
			currentPageNumber >= firstPage &&
			currentPageNumber <= lastPage &&
			originalPageList.lastIndexOf( currentPageNumber ) === index
		);
	} );

	if ( page - 3 > firstPage ) {
		pageList.splice( 1, 1, 'more' );
	}
	if ( page + 3 < lastPage ) {
		pageList.splice( pageList.length - 2, 1, 'more' );
	}

	// Arrows are always present, whether or not they are active is determined in the pagination page module
	// These strings are converted to gridicons in PaginationPage, no translation needed
	pageList.unshift( 'previous' );
	pageList.push( 'next' );

	return pageList;
};

const ImportUsers = ( { site, onSubmit }: Props ) => {
	const defaultTeamFetchOptions = { include_viewers: true };
	const userId = useSelector( getCurrentUserId );
	const translate = useTranslate();
	const usersQuery = useUsersQuery( site?.ID, defaultTeamFetchOptions ) as unknown as UsersQuery;
	const { data: externalContributors } = useExternalContributorsQuery( site?.ID );
	const { data: p2Guests } = useP2GuestsQuery( site?.ID );
	const { data: usersData, fetchNextPage, hasNextPage } = usersQuery;
	const { isPending: isSubmittingInvites, mutateAsync: sendInvites } = useSendInvites( site?.ID );

	// Get initial user data
	// Remove current user (admin) from the list
	// Remove users with roles that are not allowed to be imported
	const users =
		usersData?.users
			?.map( ( user ) => ( { user, checked: true } ) )
			?.filter( ( userItem ) => {
				const allowedRoles = getRoleFilterValues?.map( ( role ) => role.value ).flat();
				return (
					userItem.user?.linked_user_ID !== userId &&
					allowedRoles?.includes( getRole( userItem.user ) )
				);
			} ) || [];

	const totalUsers = usersData?.total ? usersData?.total - 1 : null;
	const loadedPages = usersData?.pages || [];
	const [ usersList, setUsersList ] = useState( users );
	const [ checkedUsersNumber, setCheckedUsersNumber ] = useState( totalUsers || 0 );
	const [ filteredUsers, setFilteredUsers ] = useState<
		{
			user: Member;
			checked: boolean;
		}[]
	>( [] );

	const [ userListFilters, setUserListFilters ] = useState< {
		selectedRoleFilters: string[];
		searchQuery: string;
	} >( {
		selectedRoleFilters: [],
		searchQuery: '',
	} );

	const filteredUsersList = filteredUsers.length ? filteredUsers : [];
	const usersListToDisplay =
		( userListFilters.selectedRoleFilters.length || userListFilters.searchQuery ) &&
		filteredUsersList
			? filteredUsersList
			: usersList;
	const totalUsersToDisplay =
		( userListFilters.selectedRoleFilters.length || userListFilters.searchQuery ) &&
		filteredUsersList?.length > 0
			? filteredUsersList.length
			: totalUsers;

	const [ page, setPage ] = useState( 1 );
	const perPage = 6;

	const handleSubmit = async () => {
		const selectedUsers = usersList
			.filter( ( user ) => user.checked )
			.map( ( userItem ) => ( {
				email_or_username:
					typeof userItem.user?.email === 'string' ? userItem.user?.email : userItem.user?.login,
				role: getRole( userItem.user ),
			} ) );

		if ( selectedUsers.length === 0 ) {
			return;
		}

		recordTracksEvent( 'calypso_site_importer_import_users_submit_invite', {
			number_of_invites: selectedUsers.length,
		} );

		try {
			await sendInvites( selectedUsers ).then( ( response ) => {
				return response;
			} );
		} catch ( e ) {}

		onSubmit?.();
	};

	const onChangeChecked = ( user: Member ) => ( checked: boolean ) => {
		const updatedUsersList = [ ...usersList ];
		const findIndex = updatedUsersList.findIndex( ( userItem ) => userItem.user?.ID === user?.ID );
		if ( findIndex !== -1 ) {
			updatedUsersList[ findIndex ].checked = checked;
			setUsersList( updatedUsersList );
			setCheckedUsersNumber( updatedUsersList.filter( ( x ) => x.checked )?.length );
		}
	};

	const renderToggleAllUsers = () => {
		const allUsersChecked = usersList.every( ( user ) => user.checked );
		const toggleAllUsers = () => {
			const updatedUsersList = usersList.map( ( user ) => {
				return { ...user, checked: ! allUsersChecked };
			} );
			setUsersList( updatedUsersList );
			setCheckedUsersNumber( updatedUsersList.filter( ( x ) => x.checked )?.length );
		};

		return (
			<div className="import__user-migration-toggle-all-users">
				<CheckboxControl
					className="import__user-migration-toggle-all-users-checkbox"
					checked={ allUsersChecked }
					onChange={ toggleAllUsers }
					label={ translate( 'Select all users' ) }
				/>
			</div>
		);
	};

	const renderUser = ( listUser: { user: Member; checked: boolean } ) => {
		const { user, checked } = listUser;
		const isExternalContributor =
			externalContributors && externalContributors.includes( user?.linked_user_ID ?? user?.ID );

		const isP2Guest =
			p2Guests?.guests && p2Guests.guests.includes( user?.linked_user_ID ?? user?.ID );

		return (
			<ImportedUserItem
				key={ `${ listUser?.user?.ID }-${ listUser?.checked }` }
				user={ user }
				isChecked={ checked }
				onChangeChecked={ onChangeChecked( user ) }
				isExternalContributor={ isExternalContributor }
				isP2Guest={ isP2Guest }
			/>
		);
	};

	const getTotalLoadedUsers = () => {
		return loadedPages.reduce(
			( acc: number, currentPage: { page: number; users: Member[] } ) =>
				acc + currentPage?.users.length,
			0
		);
	};

	const onPageClick = ( page: number ) => {
		setPage( page );
		const totalLoadedUsers = getTotalLoadedUsers();
		const lastPage = Math.ceil( totalLoadedUsers / perPage );
		if ( page === lastPage && hasNextPage ) {
			fetchNextPage();
		}
	};

	const renderUsersListFilters = () => {
		const searchUsers = ( query: string ) => {
			setUserListFilters( { ...userListFilters, searchQuery: query } );
		};

		const renderRoleFilterItems = () => {
			const onRoleFilterClick = ( role: { value: string[]; label: string } ) => {
				let updatedSelectedRoleFilters = [ ...userListFilters.selectedRoleFilters ];

				if ( role.value.length > 1 ) {
					role.value.forEach( ( roleValue: string ) => {
						if ( ! updatedSelectedRoleFilters.includes( roleValue ) ) {
							updatedSelectedRoleFilters.push( roleValue );
						} else {
							updatedSelectedRoleFilters = updatedSelectedRoleFilters.filter(
								( selectedRole ) => selectedRole !== roleValue
							);
						}
					} );
				} else if ( ! updatedSelectedRoleFilters.includes( role.value[ 0 ] ) ) {
					updatedSelectedRoleFilters.push( role.value[ 0 ] );
				} else {
					updatedSelectedRoleFilters = updatedSelectedRoleFilters.filter(
						( x ) => x !== role.value[ 0 ]
					);
				}

				setUserListFilters( {
					...userListFilters,
					selectedRoleFilters: updatedSelectedRoleFilters,
				} );
			};
			return getRoleFilterValues.map( ( role, index ) => {
				const isSelected =
					userListFilters?.selectedRoleFilters?.filter( ( selectedRole ) =>
						role.value.includes( selectedRole )
					).length > 0;

				return (
					<MenuItem
						value={ role.value }
						onClick={ () => onRoleFilterClick( role ) }
						icon={ isSelected ? check : null }
						isSelected={ isSelected }
						key={ index }
						role="menuitemcheckbox"
					>
						{ role.label }
					</MenuItem>
				);
			} );
		};

		return (
			<div className="import__user-migration-user-list-filters">
				<Search
					onSearch={ ( query: string ) => searchUsers( query ) }
					delaySearch
					placeholder={ translate( 'Search' ) }
				/>
				<div className="import__user-migration-user-list-role-filter">
					<DropdownMenu
						icon={ <Gridicon icon="filter" size={ 24 } /> }
						label={ translate( 'Filter by role' ) }
					>
						{ () => (
							<Fragment>
								<MenuGroup label={ translate( 'Role' ) }>{ renderRoleFilterItems() }</MenuGroup>
							</Fragment>
						) }
					</DropdownMenu>
				</div>
			</div>
		);
	};

	const renderUsersList = () => {
		const start = ( page - 1 ) * perPage;
		const end = start + perPage;

		if ( usersListToDisplay.length === 0 ) {
			return (
				<div className="import__user-migration-users">
					<div className="import__user-migration-user-list-no-users">
						{ translate( 'No users found' ) }
					</div>
				</div>
			);
		}

		return (
			<div className="import__user-migration-users">
				{ usersListToDisplay.slice( start, end ).map( ( user ) => {
					return renderUser( user );
				} ) }
			</div>
		);
	};

	const renderCurrentPageInfo = () => {
		let currentPageFirstItemIndex = ( page - 1 ) * perPage + 1;
		let currentPageLastItemIndex =
			page * perPage >= usersListToDisplay.length ? usersListToDisplay.length : page * perPage;
		let totalUsers = totalUsersToDisplay;

		if (
			( userListFilters.searchQuery || userListFilters.selectedRoleFilters.length ) &&
			usersListToDisplay.length === 0
		) {
			currentPageFirstItemIndex = 0;
			currentPageLastItemIndex = 0;
			totalUsers = 0;
		}

		return (
			<div className="import__user-migration-user-list-pagination-info">
				{ currentPageFirstItemIndex }-{ currentPageLastItemIndex } of { totalUsers } items
			</div>
		);
	};

	const renderPagination = () => {
		return (
			<div className="import__user-migration-user-list-pagination-container">
				{ renderCurrentPageInfo() }
				<Pagination
					className="import__user-migration-user-list-pagination-list"
					compact
					page={ page }
					perPage={ perPage }
					total={ usersListToDisplay.length }
					pageClick={ onPageClick }
					nextLabel=" "
					prevLabel=" "
					getPageList={ getPageList }
					paginationLeftIcon="chevron-left"
					paginationRightIcon="chevron-right"
				/>
			</div>
		);
	};

	useEffect( () => {
		let updatedUsersList = [ ...usersList ];
		if ( userListFilters.searchQuery ) {
			updatedUsersList = updatedUsersList.filter( ( user ) => {
				const userEmail =
					( typeof user.user?.email === 'string' && user.user?.email?.toLowerCase() ) || '';
				const userLogin = user.user?.login?.toLowerCase();
				const userName = user.user?.name?.toLowerCase();
				const userNiceName = user.user?.nice_name?.toLowerCase();
				const userQuery = userListFilters.searchQuery.toLowerCase();
				const currentAdmin = user.user?.linked_user_ID === userId;

				return (
					! currentAdmin &&
					( userEmail.includes( userQuery ) ||
						userLogin.includes( userQuery ) ||
						userName.includes( userQuery ) ||
						userNiceName.includes( userQuery ) )
				);
			} );
		}

		if ( userListFilters.selectedRoleFilters.length ) {
			updatedUsersList = updatedUsersList.filter( ( user ) => {
				return userListFilters.selectedRoleFilters.includes( getRole( user.user ) );
			} );
		}
		setFilteredUsers( updatedUsersList );

		if ( userListFilters.searchQuery || userListFilters.selectedRoleFilters.length ) {
			setPage( 1 );
		}
	}, [ userListFilters, usersList, userId ] );

	return (
		<div className="import__user-migration">
			<div className="import__heading import__heading-center">
				<Title>
					{ translate( 'Transfer your users{{br/}}to WordPress.com', {
						components: {
							br: <br />,
						},
					} ) }
				</Title>
				<SubTitle>
					{ translate(
						'Invite the users below to unlock WordPress.com’s power. With {{secureSignOnLink}}Secure Sign On{{/secureSignOnLink}}, 2FA, Google & Apple logins, robust support, and seamless account recovery' +
							', they’ll improve their experience with ease.',
						{
							components: {
								secureSignOnLink: (
									<ExternalLink
										target="_blank"
										href={ localizeUrl( 'https://jetpack.com/support/sso/' ) }
									/>
								),
							},
						}
					) }
				</SubTitle>
			</div>
			{ usersListToDisplay && totalUsers && (
				<div className="import__user-migration-user-list">
					{ renderUsersListFilters() }
					{ renderToggleAllUsers() }
					{ renderUsersList() }
					{ renderPagination() }
				</div>
			) }
			<div className="import__user-migration-footer">
				{ translate(
					'After clicking the button to invite, the selected users {{strong}}will receive invitation emails{{/strong}} to join your site, ensuring a smooth transition.',
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</div>
			<div className="import__user-migration-button-container">
				<NextButton
					type="button"
					onClick={ handleSubmit }
					isBusy={ isSubmittingInvites }
					disabled={ checkedUsersNumber < 1 }
				>
					{
						/* translators: The number of selected users to send WP.com invite */
						translate( 'Invite %(value)d user', 'Invite %(value)d users', {
							count: checkedUsersNumber,
							args: { value: checkedUsersNumber },
						} )
					}
				</NextButton>
			</div>
			<div className="import__user-migration-button-container">
				<Button
					variant="link"
					onClick={ () => {
						recordTracksEvent( 'calypso_site_importer_import_users_skip', {} );
						onSubmit?.();
					} }
					disabled={ isSubmittingInvites }
				>
					{ translate( 'Skip for now' ) }
				</Button>
			</div>
		</div>
	);
};

export default ImportUsers;
