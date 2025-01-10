import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
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
	userId: string;
	userSlug: string;
	lists: List[];
	isLoading: boolean;
	requestUserLists: ( userSlug: string ) => void;
}

const UserLists = ( {
	userSlug,
	lists,
	isLoading,
	requestUserLists,
}: UserListsProps ): JSX.Element => {
	const translate = useTranslate();
	const [ hasRequested, setHasRequested ] = useState( false );

	useEffect( () => {
		if ( ! hasRequested ) {
			requestUserLists( userSlug );
			setHasRequested( true );
		}
	}, [ userSlug, requestUserLists, hasRequested ] );

	if ( isLoading || ! hasRequested ) {
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
						<h3>
							<a href={ `/read/list/${ list.owner }/${ list.slug }` }>{ list.title }</a>
						</h3>
					</div>
				) ) }
			</div>
		</div>
	);
};

export default connect(
	( state: AppState, ownProps: UserListsProps ) => ( {
		lists: state.reader.lists.userLists[ ownProps.userSlug ] ?? [],
		isLoading: state.reader.lists.isRequestingUserLists[ ownProps.userSlug ] ?? false,
	} ),
	{
		requestUserLists,
	}
)( UserLists );
