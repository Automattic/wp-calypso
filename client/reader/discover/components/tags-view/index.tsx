import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import DiscoverTabsNavigation from 'calypso/reader/discover/components/tags-navigation';
import { buildDiscoverStreamKey } from 'calypso/reader/discover/helper';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

interface Props {
	width: number;
}

const DiscoverTagsView = ( { width }: Props ) => {
	const locale = useLocale();
	const followedTags = useSelector( getReaderFollowedTags );

	const { data: interestTags = [] } = useQuery( {
		queryKey: [ 'read/interests', locale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/interests`,
					apiNamespace: 'wpcom/v2',
				},
				{
					_locale: locale,
				}
			),
		select: ( data ) => {
			return data.interests;
		},
	} );

	const streamKey = buildDiscoverStreamKey(
		'tags',
		followedTags?.map( ( tag ) => tag.slug ) || []
	);

	return (
		<>
			<DiscoverTabsNavigation width={ width } selectedTab="tags" recommendedTags={ interestTags } />
			<Stream streamKey={ streamKey } useCompactCards isDiscoverStream suppressSiteNameLink />
		</>
	);
};

export default DiscoverTagsView;
