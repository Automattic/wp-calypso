import { useSendInvites } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { NextButton, Title, SubTitle } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import Pagination from 'calypso/components/pagination';
import useExternalContributorsQuery from 'calypso/data/external-contributors/use-external-contributors';
import useP2GuestsQuery from 'calypso/data/p2/use-p2-guests-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import ImportedUserItem from './imported-user-item';
import { getRole } from './utils';
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

	const users = usersData?.users?.map( ( user ) => ( { user, checked: true } ) ) || [];
	const totalUsers = usersData?.total ? usersData?.total - 1 : null;
	const loadedPages = usersData?.pages || [];
	const [ usersList, setUsersList ] = useState( users );
	const [ checkedUsersNumber, setCheckedUsersNumber ] = useState( totalUsers || 0 );

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

	const onChangeChecked = ( index: number ) => ( checked: boolean ) => {
		usersList[ index ].checked = checked;
		setUsersList( usersList );
		setCheckedUsersNumber( usersList.filter( ( x ) => x.checked )?.length );
	};

	const renderUser = (
		listUser: {
			user: Member;
			checked: boolean;
		},
		index: number
	) => {
		const { user, checked } = listUser;
		const isExternalContributor =
			externalContributors && externalContributors.includes( user?.linked_user_ID ?? user?.ID );

		const isP2Guest =
			p2Guests?.guests && p2Guests.guests.includes( user?.linked_user_ID ?? user?.ID );

		return (
			<ImportedUserItem
				key={ user?.ID }
				user={ user }
				isChecked={ checked }
				onChangeChecked={ onChangeChecked( index ) }
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

	const renderUsersList = () => {
		const start = ( page - 1 ) * perPage;
		const end = start + perPage;
		return (
			<div className="import__user-migration-users">
				{ usersList.slice( start, end ).map( ( user, index ) => {
					const originalIndex = start + index;
					return renderUser( user, originalIndex );
				} ) }
			</div>
		);
	};

	const renderCurrentPageInfo = () => {
		const currentPageFirstItemIndex = ( page - 1 ) * perPage + 1;
		const currentPageLastItemIndex =
			page * perPage >= usersList.length ? usersList.length : page * perPage;
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
					compact={ true }
					page={ page }
					perPage={ perPage }
					total={ usersList.length }
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
		let users = usersData?.users?.map( ( user ) => ( { user, checked: true } ) ) || [];
		if ( userId && users ) {
			// Remove the current user from users array
			users = users.filter( ( userItem ) => {
				return userItem?.user?.linked_user_ID !== userId;
			} );
		}
		if ( JSON.stringify( users ) !== JSON.stringify( usersList ) ) {
			setUsersList( users );
			setCheckedUsersNumber( users?.length || 0 );
		}
	}, [ userId, usersData, usersList ] );

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
			{ usersList.length > 0 && totalUsers && (
				<div className="import__user-migration-user-list">
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
