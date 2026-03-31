import { Spinner } from '@wordpress/components';
import { siteLogo, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import { decodeEntities } from 'calypso/lib/formatting';
import { UserProfileData } from 'calypso/lib/user/user';
import { RecommendedFeedsList } from 'calypso/reader/recommended-feeds-list';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useUserSitesQuery from './use-user-sites-query';

interface UserSitesProps {
	user: UserProfileData;
}

const UserSites = ( { user }: UserSitesProps ): JSX.Element | null => {
	const { ID: userId, user_login: userLogin } = user;
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const { isLoading, data, error } = useUserSitesQuery( userId );

	if ( isLoading ) {
		return (
			<div className="wp-spinner-wrapper">
				<Spinner />
				<p>{ translate( 'Loading sites' ) }</p>
			</div>
		);
	}

	if ( error ) {
		return (
			<EmptyContent
				title={ translate( 'Sorry, something went wrong.' ) }
				line={ translate( 'We couldn’t load the sites. Please try again.' ) }
			/>
		);
	}

	if ( ! data?.sites?.length ) {
		const action = currentUser?.username === userLogin && (
			<a
				className="empty-content__action button is-primary"
				href="/start?source=reader&ref=user-profile-page"
			>
				{ translate( 'Create your first site' ) }
			</a>
		);
		return (
			<EmptyContent
				illustration={ null }
				icon={ <Icon icon={ siteLogo } size={ 48 } /> }
				title={ null }
				line={ translate( 'No sites have been created yet.' ) }
				action={ action }
			/>
		);
	}

	const feedsList = data.sites.map( ( site ): FeedRecommendation => {
		return {
			ID: String( site.ID ),
			siteId: site.ID ? String( site.ID ) : '',
			feedId: site.feed_ID ? String( site.feed_ID ) : '',
			name: decodeEntities( site.name ),
			feedUrl: site.URL,
			image: site.icon?.img || site.icon?.ico || '',
		};
	} );

	return (
		<RecommendedFeedsList
			feeds={ feedsList }
			followSource="user-profile-page__sites-tab__list"
			variant="card"
		/>
	);
};

export default UserSites;
