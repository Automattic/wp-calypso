import page from '@automattic/calypso-router';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { UserData } from 'calypso/lib/user/user';
import UserLists from 'calypso/reader/user-stream/views/lists';
import UserPosts from 'calypso/reader/user-stream/views/posts';
import { requestUser } from 'calypso/state/reader/users/actions';
import './style.scss';

interface UserStreamProps {
	streamKey?: string;
	userId: string;
	user: UserData;
	isLoading: boolean;
	requestUser: ( userId: string ) => Promise< void >;
}

type UserStreamState = {
	reader: {
		users: {
			items: Record< string, UserData >;
			requesting: Record< string, boolean >;
		};
	};
};

export function UserStream( { userId, requestUser, user, streamKey, isLoading }: UserStreamProps ) {
	useEffect( () => {
		requestUser( userId );
	}, [ userId, requestUser ] );

	if ( isLoading || ! user ) {
		return <></>;
	}

	const currentPath = page.current;

	const renderContent = (): React.ReactNode => {
		const basePath = currentPath.split( '?' )[ 0 ];
		switch ( basePath ) {
			case `/read/users/${ userId }`:
				return <UserPosts streamKey={ streamKey as string } user={ user } />;
			case `/read/users/${ userId }/lists`:
				return <UserLists user={ user } />;
			default:
				return null;
		}
	};

	return (
		<div className="user-profile">
			<div className="user-profile__content-wrapper">
				<div className="user-profile__content">{ renderContent() }</div>
			</div>
		</div>
	);
}

export default connect(
	( state: UserStreamState, ownProps: UserStreamProps ) => ( {
		user: state.reader.users.items[ ownProps.userId ],
		isLoading: state.reader.users.requesting[ ownProps.userId ] ?? false,
	} ),
	{ requestUser }
)( UserStream );
