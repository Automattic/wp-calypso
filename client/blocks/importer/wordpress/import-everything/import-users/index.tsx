import { useSendInvites } from '@automattic/data-stores';
import { NextButton, Title, SubTitle } from '@automattic/onboarding';
import { useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import InfiniteList from 'calypso/components/infinite-list';
import useExternalContributorsQuery from 'calypso/data/external-contributors/use-external-contributors';
import useP2GuestsQuery from 'calypso/data/p2/use-p2-guests-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
import ImportedUserItem from './imported-user-item';
import { getRole } from './utils';
import type { UsersQuery, Member } from '@automattic/data-stores';

import './style.scss';

interface Props {
	site: {
		ID: number;
	};
	onSubmit: () => void;
}

const ImportUsers = ( { site, onSubmit }: Props ) => {
	const defaultTeamFetchOptions = { include_viewers: true };
	const translate = useTranslate();
	const usersQuery = useUsersQuery( site?.ID, defaultTeamFetchOptions ) as unknown as UsersQuery;
	const { data: externalContributors } = useExternalContributorsQuery( site?.ID );
	const { data: p2Guests } = useP2GuestsQuery( site?.ID );
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = usersQuery;
	const { isPending: isSubmittingInvites, mutateAsync: sendInvites } = useSendInvites( site?.ID );

	const users = data?.users?.map( ( user ) => ( { user, checked: true } ) ) || [];
	const [ usersList, setUsersList ] = useState( users );
	const [ checkedUsersNumber, setCheckedUsersNumber ] = useState( usersList?.length || 0 );

	const handleSubmit = async () => {
		const selectedUsers = usersList
			.filter( ( user ) => user.checked )
			.map( ( userItem ) => ( {
				email_or_username: userItem.user?.email || userItem.user?.username,
				role: getRole( userItem.user ),
			} ) );

		if ( selectedUsers.length === 0 ) {
			return;
		}

		const result = await sendInvites( selectedUsers );

		if ( result?.error ) {
			// HANDLE ERROR
		}

		onSubmit?.();
	};

	const getUserRef = ( user: Member ) => {
		return 'user-' + user?.ID;
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
									<ExternalLink target="_blank" href="https://jetpack.com/support/sso/" />
								),
							},
						}
					) }
				</SubTitle>
			</div>
			<InfiniteList
				items={ usersList }
				fetchNextPage={ fetchNextPage }
				fetchingNextPage={ isFetchingNextPage }
				lastPage={ ! hasNextPage }
				renderItem={ renderUser }
				getItemRef={ getUserRef }
				guessedItemHeight={ 126 }
				className="import__user-migration-list"
			/>
			<div className="import__user-migration-button-container">
				<NextButton type="button" onClick={ handleSubmit } disabled={ isSubmittingInvites }>
					{ sprintf(
						// translators: %s: Number of users that will get invited.
						translate( 'Invite %s users' ),
						checkedUsersNumber
					) }
				</NextButton>
			</div>
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
		</div>
	);
};

export default ImportUsers;
