import { Card } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import SectionHeader from 'calypso/components/section-header';
import { useSelector } from 'calypso/state';
import { getEarningsWithDefaultsForSiteId } from 'calypso/state/memberships/earnings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import CommissionFees from '../commission-fees';

function StatsSection() {
	const translate = useTranslate();

	const site = useSelector( getSelectedSite );

	const {
		commission,
		currency,
		forecast,
		last_month: lastMonth,
		total,
	} = useSelector( ( state ) => getEarningsWithDefaultsForSiteId( state, site?.ID ) );

	function renderEarnings() {
		if ( ! site ) {
			return <LoadingEllipsis />;
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Earnings' ) } />
				<QueryMembershipsEarnings siteId={ site.ID } />
				<Card>
					<div className="memberships__module-content module-content">
						<ul className="memberships__earnings-breakdown-list">
							<li className="memberships__earnings-breakdown-item">
								<span className="memberships__earnings-breakdown-label">
									{ translate( 'Total earnings', { context: 'Sum of earnings' } ) }
								</span>
								<span className="memberships__earnings-breakdown-value">
									{ formatCurrency( total, currency ) }
								</span>
							</li>
							<li className="memberships__earnings-breakdown-item">
								<span className="memberships__earnings-breakdown-label">
									{ translate( 'Last 30 days', { context: 'Sum of earnings over last 30 days' } ) }
								</span>
								<span className="memberships__earnings-breakdown-value">
									{ formatCurrency( lastMonth, currency ) }
								</span>
							</li>
							<li className="memberships__earnings-breakdown-item">
								<span className="memberships__earnings-breakdown-label">
									{ translate( 'Next month', {
										context: 'Forecast for the subscriptions due in the next 30 days',
									} ) }
								</span>
								<span className="memberships__earnings-breakdown-value">
									{ formatCurrency( forecast, currency ) }
								</span>
							</li>
						</ul>
					</div>
					<CommissionFees
						commission={ commission }
						iconSize={ 12 }
						siteSlug={ site?.slug }
						className="memberships__earnings-breakdown-notes"
					/>
				</Card>
			</div>
		);
	}

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	return (
		<div>
			<QueryMembershipsEarnings siteId={ site.ID } />
			<div>{ renderEarnings() }</div>
		</div>
	);
}

export default StatsSection;
