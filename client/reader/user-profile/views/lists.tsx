import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { UserData } from 'calypso/lib/user/user';
import { List } from 'calypso/reader/list-manage/types';
import UserProfileHeader from 'calypso/reader/user-profile/components/user-profile-header';
import { requestUserLists } from 'calypso/state/reader/lists/actions';

interface AppState {
	reader: {
		lists: {
			userLists: Record< string, List[] >;
			isRequestingUserLists: Record< string, boolean >;
		};
	};
}

interface UserListsProps {
	user: UserData;
	requestUserLists?: ( userLogin: string ) => void;
	lists?: List[];
	isLoading?: boolean;
}

const UserLists = ( { user, requestUserLists, lists, isLoading }: UserListsProps ): JSX.Element => {
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
		return <></>;
	}

	if ( ! lists || lists.length === 0 ) {
		return (
			<div className="user-profile__lists">
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
		<div className="user-profile__lists">
			<UserProfileHeader user={ user } />
			<div className="user-profile__lists-body">
				{ lists.map( ( list: List ) => (
					<a
						className="user-profile__lists-body-link"
						href={ `/reader/list/${ list.owner }/${ list.slug }` }
						key={ list.ID }
					>
						<div className="card reader-post-card is-compact is-clickable">
							<div className="reader-post-card__post-heading">
								<h2 className="reader-post-card__title">{ list.title }</h2>
							</div>
							<div className="reader-post-card__post-content">{ list.description }</div>
						</div>
					</a>
				) ) }
			</div>
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
