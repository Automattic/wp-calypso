import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import AutoDirection from 'calypso/components/auto-direction';
import { useSelector, useDispatch } from 'calypso/state';
import { requestUser } from 'calypso/state/reader/users/actions';
import getReaderUser from 'calypso/state/selectors/get-reader-user';
import PrimaryBlog from './primary-blog-card';
import RecommendedBlogs from './recommended-blogs';

import './styles.scss';

function HovercardContent( props ) {
	const dispatch = useDispatch();
	const { user, gravatarData } = props;

	// Prefer wpcom_id when it is given. Sometimes ID is specific to another site and wpcom_id is
	// accurate. Use ID as a fallback as sometimes wpcom_id isn't provided (like self user data).
	const userID = user.wpcom_id || user.ID;

	// For some reason there are places where the user object passes in primary blog of -1. Lets
	// find the read one with this selector.
	const readerUserData = useSelector( ( state ) => getReaderUser( state, userID, true ) );
	const { display_name: displayName, user_login: userLogin } = readerUserData || {};
	const profileUrl = userLogin ? `/reader/users/${ userLogin }` : gravatarData.profileUrl;

	const primaryBlogId = readerUserData?.primary_blog || user?.primary_blog || user?.site_ID;

	useEffect( () => {
		if ( ! readerUserData && userID ) {
			dispatch( requestUser( userID, true ) );
		}
	}, [ userID, dispatch, readerUserData ] );

	const clickProfileLink = ( e ) => {
		e.preventDefault();
		page( profileUrl );
	};

	return (
		<AutoDirection>
			{ /* Note AutoDirection needs a single child to work recursively */ }
			{ /* Stop propagation to prevent clicks in the hovercard from triggering reader card clicks */ }
			{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */ }
			<div
				onClick={ ( e ) => {
					e.stopPropagation();
				} }
			>
				{ /* Use gravatar data in the header section since this is shown for all users, even those who do not have wpcom accounts */ }

				<div className="gravatar-hovercard__header">
					<a
						className="gravatar-hovercard__avatar-link"
						href={ profileUrl }
						onClick={ clickProfileLink }
					>
						<img
							className="gravatar-hovercard__avatar"
							src={ gravatarData.avatarUrl }
							alt={ gravatarData.displayName }
							width={ 104 }
							height={ 104 }
						/>
					</a>

					<a
						className="gravatar-hovercard__name-link"
						href={ profileUrl }
						onClick={ clickProfileLink }
					>
						<h4 className="gravatar-hovercard__name">{ gravatarData.displayName }</h4>
					</a>

					<p className="gravatar-hovercard__description">{ gravatarData.description }</p>
				</div>

				{ /* Below is custom for wpcom users, and can use wpcom data more freely */ }
				{ userID && (
					<>
						<div className="gravatar-hovercard__body">
							<PrimaryBlog primaryBlogId={ primaryBlogId } displayName={ displayName } />
						</div>

						<div className="gravatar-hovercard__footer">
							{ isEnabled( 'reader/recommended-blogs-list' ) && (
								<RecommendedBlogs userLogin={ userLogin } />
							) }
						</div>
					</>
				) }
			</div>
		</AutoDirection>
	);
}

export default function HovercardContentPortal( { mountNode, ...props } ) {
	if ( ! mountNode ) {
		return null;
	}

	return ReactDOM.createPortal( <HovercardContent { ...props } />, mountNode );
}
