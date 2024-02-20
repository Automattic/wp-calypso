import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { includes } from 'lodash';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { STATS_FEATURE_DOWNLOAD_CSV } from '../constants';
import { shouldGateStats } from '../hooks/use-should-gate-stats';
import StatsCardUpsell from '../stats-card-upsell';
import DownloadCsv from '../stats-download-csv';
import DownloadCsvUpsell from '../stats-download-csv-upsell';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';

function StatsModule2( {
	className,
	hideSummaryLink,
	moduleState,
	moduleStrings,
	path,
	period,
	query,
	statType,
	summary,
	useShortLabel,
} ) {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const gateStats = useSelector( ( state ) => shouldGateStats( state, siteId, statType ) );
	const gateDownloads = useSelector( ( state ) =>
		shouldGateStats( state, siteId, STATS_FEATURE_DOWNLOAD_CSV )
	);
	const translate = useTranslate();

	const getHref = () => {
		// Some modules do not have view all abilities.
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

	const isAllTimeList = () => {
		const summarizedTypes = [
			'statsCountryViews',
			'statsTopPosts',
			'statsSearchTerms',
			'statsClicks',
			'statsReferrers',
			// statsEmailsOpen and statsEmailsClick are not used. statsEmailsSummary and statsEmailsSummaryByOpens are used at the moment,
			// besides this, email page uses separate summary component: <StatsEmailSummary />
			'statsEmailsOpen',
			'statsEmailsClick',
		];
		return summary && includes( summarizedTypes, statType );
	};

	// Local config...
	const displaySummaryLink = moduleState.data && ! hideSummaryLink;
	const hasError = false;
	const isAllTime = isAllTimeList();
	const isLoading = moduleState.isRequestingData;

	const footerClass = classNames( 'stats-module__footer-actions', {
		'stats-module__footer-actions--summary': summary,
	} );
	const detailsLink = getHref();

	return (
		<>
			<StatsListCard
				className={ classNames( className, 'stats-module__card', path ) }
				moduleType={ path }
				data={ moduleState.data }
				useShortLabel={ useShortLabel }
				title={ moduleStrings?.title }
				emptyMessage={ moduleStrings.empty }
				// metricLabel={ metricLabel }
				showMore={
					displaySummaryLink && ! summary
						? {
								url: detailsLink,
								label:
									moduleState.data.length >= 10
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
				// heroElement={ path === 'countryviews' && <Geochart query={ query } /> }
				// additionalColumns={ additionalColumns }
				// splitHeader={ !! additionalColumns }
				// mainItemLabel={ mainItemLabel }
				// showLeftIcon={ path === 'authors' }
				// listItemClassName={ listItemClassName }
				overlay={
					siteId &&
					statType &&
					gateStats && (
						<StatsCardUpsell
							className="stats-module__upsell"
							statType={ statType }
							siteId={ siteId }
						/>
					)
				}
			/>
			{ isAllTime && (
				<div className={ footerClass }>
					{ gateDownloads ? (
						<DownloadCsvUpsell siteId={ siteId } borderless />
					) : (
						<DownloadCsv
							statType={ statType }
							query={ query }
							path={ path }
							borderless
							period={ period }
						/>
					) }
				</div>
			) }
		</>
	);
}

export default StatsModule2;
