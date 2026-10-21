import { useMemo, useState } from 'react';
import useFetchBenchmarkPeers from '../../hooks/use-fetch-benchmark-peers';
import {
	EMPTY_PEER_FILTERS,
	filterPeers,
	isAnyFilterActive,
	summarizePeers,
} from '../../lib/filter-peers';
import HowToReadCard from './report/how-to-read-card';
import PeerComparisonCard from './report/peer-comparison-card';
import PeerFiltersCard from './report/peer-filters-card';
import BenchmarkStatsGrid from './report/stats-grid';
import type { AgencyBenchmark, Quarter } from '../../constants';

type Props = {
	quarter: Quarter;
	submission: AgencyBenchmark;
};

export default function BenchmarksReportState( { quarter, submission }: Props ) {
	const [ filters, setFilters ] = useState( EMPTY_PEER_FILTERS );
	const { data: peerData, isLoading: isPeersLoading } = useFetchBenchmarkPeers(
		quarter.quarter,
		quarter.year
	);

	const filteredPeers = useMemo(
		() => ( peerData ? filterPeers( peerData.peers, filters ) : [] ),
		[ peerData, filters ]
	);
	const filteredSummary = useMemo(
		() => ( isAnyFilterActive( filters ) ? summarizePeers( filteredPeers ) : null ),
		[ filters, filteredPeers ]
	);
	const isFiltered = isAnyFilterActive( filters );

	return (
		<>
			<HowToReadCard />
			<PeerFiltersCard
				ownSubmission={ submission }
				filters={ filters }
				onChange={ setFilters }
				filteredPeerCount={ filteredPeers.length }
				peersAvailable={ !! peerData }
			/>
			<BenchmarkStatsGrid
				quarter={ quarter.quarter }
				year={ quarter.year }
				metricSummaries={ filteredSummary?.metrics }
				sampleSizeOverride={ filteredSummary?.sample_size }
				isFiltered={ isFiltered }
			/>
			<PeerComparisonCard
				quarter={ quarter.quarter }
				year={ quarter.year }
				ownSubmission={ submission }
				peers={ filteredPeers }
				sampleSize={ filteredSummary?.sample_size ?? peerData?.sample_size }
				isLoading={ isPeersLoading }
			/>
		</>
	);
}
