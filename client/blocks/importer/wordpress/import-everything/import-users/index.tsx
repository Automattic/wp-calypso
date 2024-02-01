import { NextButton, Title, SubTitle } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import InfiniteList from 'calypso/components/infinite-list';
import useExternalContributorsQuery from 'calypso/data/external-contributors/use-external-contributors';
import useP2GuestsQuery from 'calypso/data/p2/use-p2-guests-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
import ImportedUserItem from './imported-user-item';
import type { UsersQuery, Member } from '@automattic/data-stores';

import './style.scss';

const ImportUsers = ( { site } ) => {
	const defaultTeamFetchOptions = { include_viewers: true };
	const { __ } = useI18n();
	const usersQuery = useUsersQuery( site?.ID, defaultTeamFetchOptions ) as unknown as UsersQuery;
	const { data: externalContributors } = useExternalContributorsQuery( site?.ID );
	const { data: p2Guests } = useP2GuestsQuery( site?.ID );
	const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = usersQuery;

	const members = data?.users || [];

	const getUserRef = ( user: Member ) => {
		return 'user-' + user?.ID;
	};

	const renderUser = ( user: Member ) => {
		const type = user.roles ? 'email' : 'viewer';

		const isExternalContributor =
			externalContributors && externalContributors.includes( user?.linked_user_ID ?? user?.ID );

		const isP2Guest =
			p2Guests?.guests && p2Guests.guests.includes( user?.linked_user_ID ?? user?.ID );

		return (
			<ImportedUserItem
				key={ user?.ID }
				user={ user }
				isExternalContributor={ isExternalContributor }
				isP2Guest={ isP2Guest }
			/>
		);
	};

	return (
		<div className="import__user-migration">
			<div className="import__heading import__heading-center">
				<Title>{ __( 'Transfer your users to WordPress.com' ) }</Title>
				<SubTitle>
					{ createInterpolateElement(
						__(
							'Invite the users below to unlock WordPress.com’s power. With <a>Secure Sign On</a>, 2FA, Google & Apple logins, robust support, and seamless account recovery' +
								', they’ll improve their experience with ease.'
						),
						{
							a: (
								<a
									className="hb-pricing-plans-embed__header-learn-more"
									target="_blank"
									href="https://jetpack.com/support/sso/"
									rel="noopener noreferrer"
								/>
							),
						}
					) }
				</SubTitle>
			</div>
			<InfiniteList
				items={ members }
				fetchNextPage={ fetchNextPage }
				fetchingNextPage={ isFetchingNextPage }
				lastPage={ ! hasNextPage }
				renderItem={ renderUser }
				getItemRef={ getUserRef }
				guessedItemHeight={ 126 }
				className="import__user-migration-list"
			/>
			<div className="import__user-migration-button-container">
				<NextButton
					type="button"
					onClick={ () => {
						console.log( 'clicked' );
					} }
				>
					{ sprintf(
						// translators: %s: Number of users that will get invited.
						__( 'Invite %s users' ),
						members?.length
					) }
				</NextButton>
			</div>
		</div>
	);
};

export default ImportUsers;
