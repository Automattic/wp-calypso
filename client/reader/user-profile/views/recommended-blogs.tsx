import { LoadingPlaceholder } from '@automattic/components';
import { siteLogo, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { useFeedRecommendationsQuery } from 'calypso/data/reader/use-feed-recommendations-query';
import { UserProfileData } from 'calypso/lib/user/user';
import { RecommendedFeed } from 'calypso/reader/recommended-feed';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

interface UserRecommendedBlogsProps {
	user: UserProfileData;
}

const UserRecommendedBlogs = ( { user }: UserRecommendedBlogsProps ): JSX.Element | null => {
	const { user_login: userLogin } = user;
	const translate = useTranslate();

	const { data: recommendedBlogs, isLoading } = useFeedRecommendationsQuery( userLogin, {
		enabled: !! userLogin,
	} );

	const currentUser = useSelector( getCurrentUser );

	if ( isLoading ) {
		return <LoadingPlaceholder />;
	}

	if ( ! recommendedBlogs?.length ) {
		const action = currentUser?.username === userLogin && (
			<a
				className="empty-content__action button is-primary"
				href={ `/reader/list/${ userLogin }/recommended-blogs/edit/items` }
			>
				{ translate( 'Add recommendations' ) }
			</a>
		);
		return (
			<EmptyContent
				illustration={ null }
				icon={ <Icon icon={ siteLogo } size={ 48 } /> }
				title={ null }
				line={ translate( 'No blogs have been recommended yet.' ) }
				action={ action }
			/>
		);
	}

	return (
		<ul className="user-profile__recommended-blogs-list">
			{ recommendedBlogs.map( ( blog ) => (
				<RecommendedFeed key={ blog.ID } blog={ blog } classPrefix="user-profile" />
			) ) }
		</ul>
	);
};

export default UserRecommendedBlogs;
