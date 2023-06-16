import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

const DEFAULT_TAB = 'recommended-tab';

const DiscoverStream = ( props ) => {
	const locale = useLocale();
	const followedTags = useSelector( getReaderFollowedTags ) || [];
	const [ selectedTab, setSelectedTab ] = useState( DEFAULT_TAB );
	const { data: interestTags } = useQuery( {
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

	// Filter followed tags out of interestTags to get recommendedTags.
	const followedTagSlugs = followedTags.map( ( tag ) => tag.slug );
	const recommendedTags = interestTags.filter( ( tag ) => ! followedTagSlugs.includes( tag.slug ) );

	const DiscoverNavigation = () => (
		<SegmentedControl
			primary
			className="discover-stream__tab-control"
			// TODO, move styles to a scss file and update further.
			style={ { overflowX: 'scroll' } }
		>
			<SegmentedControl.Item
				key={ DEFAULT_TAB }
				selected={ DEFAULT_TAB === selectedTab }
				onClick={ () => setSelectedTab( DEFAULT_TAB ) }
			>
				{ translate( 'Recommended' ) }
			</SegmentedControl.Item>
			{ recommendedTags.map( ( tag ) => {
				return (
					<SegmentedControl.Item
						key={ tag.slug }
						selected={ tag.slug === selectedTab }
						onClick={ () => setSelectedTab( tag.slug ) }
					>
						{ tag.title }
					</SegmentedControl.Item>
				);
			} ) }
		</SegmentedControl>
	);

	return (
		<>
			<DiscoverNavigation />
			<Stream { ...props } />;
		</>
	);
};
export default DiscoverStream;
