import { localize, translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import useStatsStrings from 'calypso/my-sites/stats/hooks/use-stats-strings';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getEmailStatsNormalizedData,
	shouldShowLoadingIndicator,
} from 'calypso/state/stats/emails/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Geochart from '../geochart';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';
import '../stats-module/style.scss';

export interface StatsEmailModuleProps {
	postId: number;
	period: string;
	date: string;
	statType: string;
	path: string;
}

interface StatsEmailMapStateProps {
	siteSlug: string | null;
	siteId: number | null;
	query: { period: string; date: string };
	isLoading: boolean;
	isJetpack: boolean | null;
	data: any;
}

const StatsEmailModule: React.FC< StatsEmailModuleProps & StatsEmailMapStateProps > = ( props ) => {
	const { path, data, postId, statType, query, isLoading, isJetpack } = props;

	// Only show loading indicators when nothing is in state tree, and request in-flight

	const { [ path ]: moduleStrings } = useStatsStrings( {
		supportsArchiveStats: false,
		isSiteJetpackNotAtomic: !! isJetpack,
	} );

	const hasError = false; // TODO: Support error state in redux store
	const metricLabel = statType === 'clicks' ? translate( 'Clicks' ) : translate( 'Opens' );

	return (
		// @ts-ignore: Suppress missing props error
		<StatsListCard
			title={ moduleStrings.title }
			moduleType={ path }
			data={ data }
			emptyMessage={ moduleStrings.empty }
			error={ hasError && <ErrorPanel /> }
			loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
			metricLabel={ metricLabel }
			heroElement={
				path === 'countries' && (
					<Geochart
						kind="email"
						statType={ statType }
						postId={ postId }
						query={ query }
						isLoading={ isLoading }
						numberLabel={ metricLabel }
					/>
				)
			}
		/>
	);
};

export default connect(
	( state: IAppState, ownProps: StatsEmailModuleProps ): StatsEmailMapStateProps => {
		const siteId = getSelectedSiteId( state )!;
		const { postId, period, date, statType, path } = ownProps;

		return {
			siteId,
			query: { period, date },
			isLoading: shouldShowLoadingIndicator( state, siteId, postId, period, statType, date, path ),
			data: getEmailStatsNormalizedData( state, siteId, postId, period, statType, date, path ),
			siteSlug: getSiteSlug( state, siteId ),
			isJetpack: isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ),
		};
	}
)( localize( StatsEmailModule ) );
