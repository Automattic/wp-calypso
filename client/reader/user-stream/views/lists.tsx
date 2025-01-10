import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { List } from 'calypso/reader/list-manage/types';
import { requestUserLists } from 'calypso/state/reader/users/actions';

interface UserListsProps {
	userId: string;
	userSlug: string;
	lists: List[];
	isLoading: boolean;
	requestUserLists: ( userId: string, userSlug: string ) => void;
}

const UserLists = ( {
	userId,
	userSlug,
	lists,
	isLoading,
	requestUserLists,
}: UserListsProps ): JSX.Element => {
	const translate = useTranslate();

	useEffect( () => {
		requestUserLists( userId, userSlug );
	}, [ userId, userSlug, requestUserLists ] );

	if ( isLoading ) {
		return <></>;
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
			<div className="user-profile__lists-header">
				{ lists.map( ( list: List ) => (
					<div className="user-profile__list" key={ list.ID }>
						<h3>{ list.title }</h3>
					</div>
				) ) }
			</div>
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
