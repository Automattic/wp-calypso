import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { UserData } from 'calypso/lib/user/user';
import { List } from 'calypso/reader/list-manage/types';
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
	currentUser: UserData | null;
}

export const UserLists = ( {
	user,
	requestUserLists,
	lists,
	isLoading,
	currentUser,
}: UserListsProps ): JSX.Element => {
	const translate = useTranslate();
	const [ hasRequested, setHasRequested ] = useState( false );

	// Info about the owner of the lists we are viewing.
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

	const filteredLists =
		lists?.filter( ( list: List ) => {
			if ( list.is_public ) {
				return true;
			}

			// If the current user is looking at their own profile, show all lists.
			// Otherwise, only show public lists.
			const isViewingOwnProfile = user.user_login === currentUser?.username;
			return isViewingOwnProfile;
		} ) || [];

	if ( filteredLists.length === 0 ) {
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
			<div className="user-profile__lists-body">
				{ filteredLists.map( ( list: List ) => (
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
