import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import DomainTip from 'calypso/blocks/domain-tip';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import CommissionFees from 'calypso/my-sites/earn/components/commission-fees';
import { useSelector } from 'calypso/state';
import { getEarningsWithDefaultsForSiteId } from 'calypso/state/memberships/earnings/selectors';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsPageHeader from '../stats-page-header';
import PageViewTracker from '../stats-page-view-tracker';

const StatsEarnPage = () => {
	const translate = useTranslate();
	// Use hooks for Redux pulls.
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	// Run-time configuration.
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const statsModuleListClass = classNames(
		'stats__module-list stats__module--unified',
		{
			'is-odyssey-stats': isOdysseyStats,
			'is-jetpack': isJetpack,
		},
		'earn-page'
	);

	const earnings = useSelector( ( state ) => getEarningsWithDefaultsForSiteId( state, siteId ) );

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	// sessionStorage.setItem( 'jp-stats-last-tab', 'subscribers' );

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/earn/:site" title="Stats > Earn" />
			<div className="stats">
				<StatsPageHeader
					page="subscribers"
					subHeaderText={ translate( "View your site's performance and learn from trends." ) }
				/>
				{ siteId && (
					<div>
						<DomainTip
							siteId={ siteId }
							event="stats_subscribers_domain"
							vendor={ getSuggestionsVendor() }
						/>
					</div>
				) }
				<StatsNavigation selectedItem="earn" siteId={ siteId } slug={ siteSlug } />
				<QueryMembershipsEarnings siteId={ siteId } />

				<div className={ statsModuleListClass }>
					<h3 className="highlight-cards-heading">{ translate( 'Overview' ) }</h3>

					<div className="highlight-cards-list">
						<Card className="highlight-card">
							<h4 className="highlight-card-heading">
								{ translate( 'Total earnings', { context: 'Sum of earnings' } ) }
							</h4>
							<div className="highlight-card-info-item-list">
								{ formatCurrency( earnings.total, earnings.currency ) }
							</div>
						</Card>
						<Card className="highlight-card">
							<h4 className="highlight-card-heading">
								{ translate( 'Last 30 days', { context: 'Sum of earnings over last 30 days' } ) }
							</h4>
							<div className="highlight-card-info-item-list">
								{ formatCurrency( earnings.last_month, earnings.currency ) }
							</div>
						</Card>
						<Card className="highlight-card">
							<h4 className="highlight-card-heading">
								{ translate( 'Next month forecast', {
									context: 'Forecast for the subscriptions due in the next 30 days',
								} ) }
							</h4>
							<div className="highlight-card-info-item-list">
								{ formatCurrency( earnings.forecast, earnings.currency ) }
							</div>
						</Card>
					</div>
				</div>

				<CommissionFees
					commission={ earnings.commission }
					iconSize={ 12 }
					siteSlug={ siteSlug }
					className="memberships__earnings-breakdown-notes"
				/>

				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsEarnPage;
