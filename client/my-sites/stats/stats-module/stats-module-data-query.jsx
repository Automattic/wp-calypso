import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
// import { shouldGateStats } from '../hooks/use-should-gate-stats';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from './placeholder';

import './style.scss';
import '../stats-list/style.scss';

const StatsModuleDataQuery = ( {
	data,
	path,
	className,
	useShortLabel,
	moduleStrings,
	summary,
	period,
	metricLabel,
	hideSummaryLink,
	isLoading,
} ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	// const gateStats = useSelector( ( state ) => shouldGateStats( state, siteId, statType ) );
	const translate = useTranslate();

	// Show error and loading based on the query
	// const isLoading = false;
	const hasError = false;

	const displaySummaryLink = data && ! hideSummaryLink;
	// const footerClass = classNames( 'stats-module__footer-actions', {
	// 	'stats-module__footer-actions--summary': summary,
	// } );

	const getHref = () => {
		// const { summary, period, path, siteSlug } = this.props;

		// Some modules do not have view all abilities
		if ( ! summary && period && path && siteSlug ) {
			return (
				'/stats/' +
				period.period +
				'/' +
				path +
				'/' +
				siteSlug +
				'?startDate=' +
				period.startOf.format( 'YYYY-MM-DD' )
			);
		}
	};

	return (
		<StatsListCard
			className={ classNames( className, 'stats-module__card', path ) }
			moduleType={ path }
			data={ data }
			useShortLabel={ useShortLabel }
			title={ moduleStrings?.title }
			emptyMessage={ moduleStrings.empty }
			metricLabel={ metricLabel }
			showMore={
				displaySummaryLink && ! summary
					? {
							url: getHref(),
							label:
								data.length >= 10
									? translate( 'View all', {
											context: 'Stats: Button link to show more detailed stats information',
									  } )
									: translate( 'View details', {
											context: 'Stats: Button label to see the detailed content of a panel',
									  } ),
					  }
					: undefined
			}
			error={ hasError && <ErrorPanel /> }
			loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
			// splitHeader={ !! additionalColumns }
			// mainItemLabel={ mainItemLabel }
			// overlay={
			// 	siteId &&
			// 	statType &&
			// 	gateStats && (
			// 		<StatsCardUpsell
			// 			className="stats-module__upsell"
			// 			statType={ statType }
			// 			siteId={ siteId }
			// 		/>
			// 	)
			// }
		/>
	);
};

export default StatsModuleDataQuery;
