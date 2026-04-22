import './styles.scss';
import { userQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import ReactDOM from 'react-dom';
import GravatarHeader from './gravatar-header';
import PrimaryBlog from './primary-blog-card';
import RecommendedBlogs from './recommended-blogs';

function HovercardContent( props ) {
	const { user, gravatarData, processedAvatarUrl, closeCard } = props;
	const { data: readerUserData } = useQuery( userQuery( user.user_login, user.wpcom_id ) );
	const { display_name: displayName, user_login: userLogin } = readerUserData || {};
	const primaryBlogId = readerUserData?.primary_blog?.ID || user?.primary_blog || user?.site_ID;

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
				{ !! user?.wpcom_id && (
					<>
						<div className="gravatar-hovercard__body">
							<PrimaryBlog
								primaryBlogId={ primaryBlogId }
								displayName={ displayName }
								closeCard={ closeCard }
							/>
						</div>

						<div className="gravatar-hovercard__footer">
							<RecommendedBlogs userLogin={ userLogin } closeCard={ closeCard } />
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
