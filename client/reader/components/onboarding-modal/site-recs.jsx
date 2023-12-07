import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

const SiteRecommendations = () => {
	const followedTags = useSelector( getReaderFollowedTags ) || [];

	const followedTagSlugString = followedTags.reduce(
		( acc, tag, index ) => acc + ( index === 0 ? '' : ',' ) + tag.slug,
		''
	);

	const { data: recommendedSites = [] } = useQuery( {
		queryKey: [ 'reader-onboarding-recommended-sites', followedTagSlugString ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/tags/cards`,
					apiNamespace: 'wpcom/v2',
				},
				{
					tags: followedTagSlugString,
					site_recs_per_card: 10,
					tag_recs_per_card: 0,
				}
			),
		select: ( data ) => {
			console.log( data );
			const recommendedBlogs = data.cards.filter( ( card ) => card.type === 'recommended_blogs' );
			console.log( recommendedBlogs[ 0 ]?.data );
			return data?.cards?.recommendedSites;
		},
	} );

	return <h1>Recommended Sites</h1>;
};

export default SiteRecommendations;
