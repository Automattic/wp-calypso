import './lists.scss';
import { readUserListsQuery } from '@automattic/api-queries';
import { SummaryButton } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { List } from 'calypso/reader/list-manage/types';
import type { ReaderUser } from '@automattic/api-core';
import type { JSX } from 'react';

interface UserListsProps {
	user: ReaderUser;
}

export const UserLists = ( { user }: UserListsProps ): JSX.Element => {
	const translate = useTranslate();
	const userLogin = user.user_login ?? '';
	const { data, isLoading, isFetched } = useQuery( readUserListsQuery( userLogin ) );
	const lists = data?.lists ?? [];

	if ( isLoading || ! isFetched ) {
		return (
			<div className="user-profile__loader">
				<Spinner /> { translate( 'Loading lists' ) }...
			</div>
		);
	}

	if ( lists.length === 0 ) {
		return (
			<div className="user-profile__lists">
				<EmptyContent
					illustration={ null }
					icon={ <Icon icon={ formatListBullets } size={ 48 } /> }
					title={ null }
					line={ translate( 'No lists yet.' ) }
				/>
			</div>
		);
	}

	return (
		<div className="user-profile__lists">
			{ lists.map( ( list: List ) => {
				let description: React.ReactNode = list.description;
				if ( list.slug === 'recommended-blogs' ) {
					description = translate( 'A list of blogs recommended by %s.', {
						args: `@${ list.owner }`,
					} );
				}

				return (
					<SummaryButton
						key={ `user-list-${ list.ID }` }
						href={ `/reader/list/${ list.owner }/${ list.slug }` }
						title={ list.title }
						description={ description || translate( 'No description.' ) }
					/>
				);
			} ) }
		</div>
	);
};

export default UserLists;
