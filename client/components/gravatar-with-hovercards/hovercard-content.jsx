import { isEnabled } from '@automattic/calypso-config';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'calypso/state';
import { requestUser } from 'calypso/state/reader/users/actions';
import getReaderUser from 'calypso/state/selectors/get-reader-user';
import GravatarHeader from './gravatar-header';
import PrimaryBlog from './primary-blog-card';
import RecommendedBlogs from './recommended-blogs';

import './styles.scss';

function HovercardContent( props ) {
	const dispatch = useDispatch();
	const { user, gravatarData, processedAvatarUrl, closeCard } = props;

	// Prefer wpcom_id when it is given. Sometimes ID is specific to another site and wpcom_id is
	// accurate. Use ID as a fallback as sometimes wpcom_id isn't provided (like self user data).
	const userID = user.wpcom_id || user.ID;

	// For some reason there are places where the user object passes in primary blog of -1. Lets
	// find the read one with this selector.
	const readerUserData = useSelector( ( state ) => getReaderUser( state, userID, true ) );
	const { display_name: displayName, user_login: userLogin } = readerUserData || {};

	const primaryBlogId = readerUserData?.primary_blog || user?.primary_blog || user?.site_ID;

	useEffect( () => {
		if ( ! readerUserData && userID ) {
			dispatch( requestUser( userID, true ) );
		}
	}, [ userID, dispatch, readerUserData ] );

	return (
		<>
			{ /* Stop propagation to prevent clicks in the hovercard from triggering reader card clicks */ }
			{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */ }
			<div
				onClick={ ( e ) => {
					e.stopPropagation();
				} }
			>
				{ /* Use gravatar data in the header section since this is shown for all users, even those who do not have wpcom accounts */ }
				<div className="gravatar-hovercard__header">
					<GravatarHeader
						gravatarData={ gravatarData }
						processedAvatarUrl={ processedAvatarUrl }
						userLogin={ userLogin }
						closeCard={ closeCard }
					/>
				</div>

				{ /* Below is custom for wpcom users, and can use wpcom data more freely */ }
				{ userID && (
					<>
						<div className="gravatar-hovercard__body">
							<PrimaryBlog
								primaryBlogId={ primaryBlogId }
								displayName={ displayName }
								closeCard={ closeCard }
							/>
						</div>

						<div className="gravatar-hovercard__footer">
							{ isEnabled( 'reader/recommended-blogs-list' ) && (
								<RecommendedBlogs userLogin={ userLogin } closeCard={ closeCard } />
							) }
						</div>
					</>
				) }
			</div>
		</>
	);
}

export default function HovercardContentPortal( { mountNode, ...props } ) {
	if ( ! mountNode ) {
		return null;
	}

	return ReactDOM.createPortal( <HovercardContent { ...props } />, mountNode );
}
