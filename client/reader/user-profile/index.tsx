import page from '@automattic/calypso-router';
import { useTranslate, fixMe } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { UserData } from 'calypso/lib/user/user';
import ReaderBackButton from 'calypso/reader/components/back-button';
import UserProfileHeader from 'calypso/reader/user-profile/components/user-profile-header';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';
import UserLists from 'calypso/reader/user-profile/views/lists';
import UserPosts from 'calypso/reader/user-profile/views/posts';
import { requestUser } from 'calypso/state/reader/users/actions';
import getReaderUser from 'calypso/state/selectors/get-reader-user';
import './style.scss';

export interface UserProfileProps {
	userLogin: string;
	userId: string;
	user: UserData | undefined;
	path: string;
	isLoading: boolean;
	requestUser: ( userLogin: string, findById?: boolean ) => Promise< void >;
}

type UserProfileState = {
	reader: {
		users: {
			items: Record< string, UserData >;
			requesting: Record< string, boolean >;
		};
	};
};

export function UserProfile( props: UserProfileProps ): JSX.Element | null {
	const { userLogin, userId, path, requestUser, user, isLoading } = props;
	const translate = useTranslate();

	useEffect( () => {
		if ( ! user ) {
			if ( userLogin ) {
				requestUser( userLogin );
			}
			if ( userId ) {
				requestUser( userId, true );
			}
		}
	}, [ userLogin, requestUser, userId, user ] );

	useEffect( () => {
		if ( path?.startsWith( '/reader/users/id/' ) && user ) {
			page.replace( `/reader/users/${ user.user_login }` );
		}
	}, [ path, user ] );

	if ( isLoading ) {
		return <></>;
	}

	if ( ! user ) {
		return (
			<EmptyContent
				illustration=""
				title={ fixMe( {
					text: 'User not found.',
					newCopy: translate( 'User not found.' ),
					oldCopy: translate( 'Uh oh. User not found.' ),
				} ) }
				line={ translate( 'Sorry, the user you were looking for could not be found.' ) }
				action={ translate( 'Return to Reader' ) }
				actionURL="/reader"
				className="user-profile__404"
			/>
		);
	}

	const userProfileUrl = getUserProfileUrl( userLogin );

	const renderContent = (): React.ReactNode => {
		const basePath = path?.split( '?' )[ 0 ];
		switch ( basePath ) {
			case userProfileUrl:
				return <UserPosts user={ user } />;
			case `${ userProfileUrl }/lists`:
				return <UserLists user={ user } />;
			default:
				return null;
		}
	};

	return (
		<div className="user-profile">
			<div className="user-profile__wrapper">
				<ReaderBackButton />
				<div className="user-profile__wrapper-content">
					<UserProfileHeader user={ user } />
					{ renderContent() }
				</div>
			</div>
		</div>
	);
}

export default connect(
	( state: UserProfileState, ownProps: UserProfileProps ) => ( {
		// The following logic works because userLogin and userId are mutually exclusive via the
		// routes.
		user: getReaderUser(
			state,
			ownProps.userLogin || ownProps.userId,
			ownProps.userLogin ? false : true
		),
		isLoading: state.reader.users.requesting[ ownProps.userLogin || ownProps.userId ] ?? false,
	} ),
	{ requestUser }
)( UserProfile );
