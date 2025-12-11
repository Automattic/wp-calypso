import { __experimentalSpacer as Spacer, __experimentalText as Text } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { formatAgencyResources } from 'calypso/a8c-for-agencies/data/learn/lib/format-agency-resources';
import useFetchAgencyResources from 'calypso/a8c-for-agencies/data/learn/use-fetch-agency-resources';
import ArtOfTheDeal from './art-of-the-deal';
import BrowseAllResources from './browse-all-resources';
import { useFilterResources } from './hooks/use-filter-resources';
import TopResources from './top-resources';

import './style.scss';

export default function ResourceCenterOverviewContent() {
	const { data, isLoading } = useFetchAgencyResources();

	const resources = useMemo( () => {
		if ( ! data?.results ) {
			return [];
		}
		const formattedResources = formatAgencyResources( data.results );
		// Sort by created_at descending (newest first)
		return formattedResources.sort( ( a, b ) => {
			return new Date( b.createdAt ).getTime() - new Date( a.createdAt ).getTime();
		} );
	}, [ data ] );

	const { topResources, artOfTheDealResources, browseAllResources } =
		useFilterResources( resources );

	return (
		<>
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>
					{ __(
						"Explore our resource center for agencies, where you'll find exclusive materials designed to help you sell and integrate Automattic products effectively. These tools not only enhance your sales strategies but also support you in running your agency smoothly and maximizing conversions."
					) }
				</Text>
			</Spacer>

			<TopResources resources={ topResources } isLoading={ isLoading } />

			<ArtOfTheDeal resources={ artOfTheDealResources } isLoading={ isLoading } />

			<BrowseAllResources resources={ browseAllResources } isLoading={ isLoading } />
		</>
	);
}
