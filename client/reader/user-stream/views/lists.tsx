import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { UserData } from 'calypso/lib/user/user';
import { List } from 'calypso/reader/list-manage/types';
import UserProfileHeader from 'calypso/reader/user-stream/components/user-profile-header';
import { requestUserLists } from 'calypso/state/reader/users/actions';

interface UserListsProps {
	user: UserData;
	userId: string;
	userSlug: string;
	lists: List[];
	isLoading: boolean;
	requestUserLists: ( userId: string, userSlug: string ) => void;
}

const UserLists = ( {
	user,
	userId,
	userSlug,
	lists,
	isLoading,
	requestUserLists,
}: UserListsProps ): JSX.Element => {
	const translate = useTranslate();

	useEffect( () => {
		requestUserLists( userId, userSlug );
	}, [ userId, userSlug, isLoading, requestUserLists ] );

	if ( isLoading ) {
		return <></>;
	}

	if ( ! lists || lists.length === 0 ) {
		return (
			<div className="user-stream__lists">
				<UserProfileHeader user={ user } />
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
		<div className="user-stream__lists">
			<UserProfileHeader user={ user } />
			{ lists.map( ( list: List ) => (
				<div className="user-profile__list" key={ list.ID }>
					<h3>{ list.title }</h3>
				</div>
			) ) }
		</div>
	);
};

export default connect(
	( state: UserStreamState, ownProps: UserStreamProps ) => {
		return {
			lists: state.reader.users.lists[ ownProps.userId ],
			isLoading: state.reader.users.listRequests[ ownProps.userId ] ?? false,
		};
	},
	{
		requestUserLists,
	}
)( UserLists );
