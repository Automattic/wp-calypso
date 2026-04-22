import './lists.scss';
import { SummaryButton } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { List } from 'calypso/reader/list-manage/types';
import { requestUserLists } from 'calypso/state/reader/lists/actions';
import type { ReaderUser } from '@automattic/api-core';

interface AppState {
	reader: {
		lists: {
			userLists: Record< string, List[] >;
			isRequestingUserLists: Record< string, boolean >;
		};
	};
}

interface UserListsProps {
	user: ReaderUser;
	requestUserLists?: ( userLogin: string ) => void;
	lists?: List[];
	isLoading?: boolean;
}

export const UserLists = ( {
	user,
	requestUserLists,
	lists,
	isLoading,
}: UserListsProps ): JSX.Element => {
	const translate = useTranslate();
	const [ hasRequested, setHasRequested ] = useState( false );
	const userLogin = user.user_login;

	useEffect( () => {
		if ( ! hasRequested && requestUserLists && userLogin ) {
			requestUserLists( userLogin );
			setHasRequested( true );
		}
	}, [ userLogin, requestUserLists, hasRequested ] );

	if ( isLoading || ! hasRequested ) {
		return (
			<div className="user-profile__lists-loader">
				<Spinner /> { translate( 'Loading lists' ) }...
			</div>
		);
	}

	if ( ! lists || lists.length === 0 ) {
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

export default connect(
	( state: AppState, ownProps: UserListsProps ) => ( {
		lists: state.reader.lists.userLists[ ownProps.user.user_login ?? '' ] ?? [],
		isLoading: state.reader.lists.isRequestingUserLists[ ownProps.user.user_login ?? '' ] ?? false,
	} ),
	{
		requestUserLists,
	}
)( UserLists );
