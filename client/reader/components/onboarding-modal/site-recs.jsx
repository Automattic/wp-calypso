import { LoadingPlaceholder } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import ConnectedReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/connected';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

const SiteRecommendations = () => {
	const followedTags = useSelector( getReaderFollowedTags ) || [];

	const followedTagSlugs = followedTags.map( ( tag ) => tag.slug );
	followedTagSlugs.sort();

	const { data: recommendedSites = [] } = useQuery( {
		queryKey: [ 'reader-onboarding-recommended-sites', followedTagSlugs ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/tags/cards`,
					apiNamespace: 'wpcom/v2',
				},
				{
					tags: followedTagSlugs,
					site_recs_per_card: 20,
					tag_recs_per_card: 0,
				}
			),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		select: ( data ) => {
			const recommendedBlogs = data.cards.filter( ( card ) => card.type === 'recommended_blogs' );
			return recommendedBlogs[ 0 ]?.data;
		},
	} );

	const halfSize = Math.ceil( recommendedSites.length / 2 );
	const sitesList1 = recommendedSites.slice( 0, halfSize );
	const sitesList2 = recommendedSites.slice( halfSize );

	return (
		<div className="reader-onboarding-modal__recommended-sites">
			{ recommendedSites.length === 0 && <LoadingPlaceholder /> }
			<div className="reader-onboarding-modal__recommended-sites-list">
				{ sitesList1.map( ( site ) => (
					<ConnectedReaderSubscriptionListItem
						key={ site.feed_ID }
						feedId={ site.feed_ID }
						siteId={ site.blog_ID }
						site={ site }
						url={ site.URL }
						showLastUpdatedDate={ false }
						showNotificationSettings={ false }
						showFollowedOnDate={ false }
						followSource="reader-onboarding-modal"
						disableSuggestedFollows
					/>
				) ) }
			</div>
			<div className="reader-onboarding-modal__recommended-sites-list">
				{ sitesList2.map( ( site ) => (
					<ConnectedReaderSubscriptionListItem
						key={ site.feed_ID }
						feedId={ site.feed_ID }
						siteId={ site.blog_ID }
						site={ site }
						url={ site.URL }
						showLastUpdatedDate={ false }
						showNotificationSettings={ false }
						showFollowedOnDate={ false }
						followSource="reader-onboarding-modal"
						disableSuggestedFollows
					/>
				) ) }
			</div>
		</div>
	);
};

export default SiteRecommendations;
