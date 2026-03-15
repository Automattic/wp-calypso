import { ProgressBar } from '@automattic/components';
import { formatNumber, formatCurrency } from '@automattic/number-formatters';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import getPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { TitanOrder } from 'calypso/state/a8c-for-agencies/types';
import { calculateEffectiveCapacity } from './capacity';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

import './style.scss';

type Props = {
	existingPlan: APIProductFamilyProduct | null;
};

export default function PressableUsageDetails( { existingPlan }: Props ) {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const planUsage = agency?.third_party?.pressable?.usage;
	const titanUsage = agency?.third_party?.pressable?.titan_usage;
	const { data: pressableLicensesData } = useFetchLicenses(
		LicenseFilter.NotRevoked,
		'pressable',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Descending,
		1,
		100
	);

	const planInfo = existingPlan?.slug ? getPressablePlan( existingPlan?.slug ) : null;

	// Filter active Titan orders and calculate total active inboxes
	const activeOrders =
		titanUsage?.orders?.filter( ( order: TitanOrder ) => order.status === 'active' ) || [];
	const totalActiveInboxes = activeOrders.reduce(
		( total: number, order: TitanOrder ) => total + order.billable_inboxes,
		0
	);

	// Format trial end date
	const formatTrialEndDate = ( dateString: string ): string => {
		if ( ! dateString ) {
			return '';
		}

		const date = new Date( dateString );
		return new Intl.DateTimeFormat( 'en-US', {
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC',
		} ).format( date );
	};

	if ( ! planInfo ) {
		return null;
	}

	const effectiveCapacity = calculateEffectiveCapacity( planInfo, pressableLicensesData?.items );

	// Only render the Titan card if there are active orders
	const shouldRenderTitanCard = titanUsage?.orders && activeOrders.length > 0;

	return (
		<div
			className={ clsx( 'pressable-usage-details__card', {
				'is-empty': ! planUsage,
			} ) }
		>
			{ ! planUsage && (
				<div className="pressable-usage-details__empty-message">
					{ translate( "View your usage data here when it's available." ) }
				</div>
			) }
			<div className="pressable-usage-details__info">
				<div className="pressable-usage-details__info-item">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">
							{ translate( 'Storage used' ) }
						</div>
						<div className="pressable-usage-details__info-top-right storage">
							{ planUsage &&
								translate( '%(used_storage)s of %(max_storage)s GB', {
									args: {
										used_storage: planUsage ? planUsage.storage_gb : '?',
										max_storage: effectiveCapacity.storage,
									},
									comment: '%(used_storage)s and %(max_storage)d are the storage values in GB.',
								} ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						<ProgressBar
							className="pressable-usage-details__storage-bar"
							compact
							value={ planUsage ? planUsage.storage_gb : 0 }
							total={ effectiveCapacity.storage }
						/>
					</div>
				</div>
			</div>
			<div className="pressable-usage-details__info">
				<div className="pressable-usage-details__info-item sites">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">
							{ translate( 'Sites created' ) }
						</div>
						<div className="pressable-usage-details__info-top-right">
							{ translate( '%(total_sites)s of %(max_sites)s', {
								args: {
									max_sites: effectiveCapacity.install,
									total_sites: planUsage?.sites_count ?? 0,
								},
								comment:
									'%(total_sites)s is the number of installed sites and %(max_sites)s is the maximum number of sites.',
							} ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						<ProgressBar
							className="pressable-usage-details__storage-bar"
							compact
							value={ planUsage ? planUsage.sites_count : 0 }
							total={ effectiveCapacity.install }
						/>
					</div>
				</div>

				<div className="pressable-usage-details__info-item visits">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">
							{ translate( 'Monthly visits' ) }
						</div>
						<div className="pressable-usage-details__info-top-right">
							{ translate( '%(visits_count)s of %(max_visits)s', {
								args: {
									max_visits: formatNumber( effectiveCapacity.visits ),
									visits_count: formatNumber( planUsage?.visits_count ?? 0 ),
								},
								comment:
									'%(visits_count)s is the number of month visits of the site and %(max_visits)s is the maximum number of visits.',
							} ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						<ProgressBar
							className="pressable-usage-details__storage-bar"
							compact
							value={ planUsage ? planUsage.visits_count : 0 }
							total={ effectiveCapacity.visits }
						/>
					</div>
				</div>
			</div>
			{ shouldRenderTitanCard && (
				<div className="pressable-usage-details__info">
					<div className="pressable-usage-details__info-item">
						<div className="pressable-usage-details__info-header">
							<div className="pressable-usage-details__info-label">
								{ translate( 'Titan Email' ) }
								<span className="pressable-usage-details__addon-tag">
									{ translate( 'add-on' ) }
								</span>
							</div>
							<div className="pressable-titan-usage-details__info-top-right">
								{ translate( '%(total_inboxes)s inboxes', {
									args: {
										total_inboxes: totalActiveInboxes,
									},
									comment: '%(total_inboxes)s is the total number of active email inboxes.',
								} ) }
								<div className="pressable-titan-usage-details__info-inbox-price">
									{ translate( '%(inbox_price)s per inbox monthly', {
										args: {
											inbox_price: formatCurrency( 3.5, 'USD' ),
										},
										comment: '%(inbox_price)s is the price per inbox.',
									} ) }
								</div>
							</div>
						</div>
						<hr />
						<div className="pressable-usage-details__info-value">
							<div className="pressable-usage-details__titan-domains">
								{ activeOrders.map( ( order: TitanOrder ) => (
									<div key={ order.domain } className="pressable-usage-details__titan-domain-item">
										<div className="pressable-usage-details__titan-domain-info">
											<span className="pressable-usage-details__titan-domain">
												{ order.domain }
											</span>
											<span className="pressable-usage-details__titan-plan-label">
												{ translate( 'standard' ) }
											</span>
											{ order.trial_end_at && (
												<>
													<span className="pressable-usage-details__titan-trial-badge">
														{ translate( 'trial' ) }
													</span>
													<span className="pressable-usage-details__titan-trial-text">
														{ translate( 'The trial ends by %(date)s', {
															args: {
																date: formatTrialEndDate( order.trial_end_at ),
															},
															comment: '%(date)s is the formatted trial end date.',
														} ) }
													</span>
												</>
											) }
										</div>
										<div className="pressable-usage-details__titan-inboxes">
											{ translate( '%(inboxes)s inbox', '%(inboxes)s inboxes', {
												count: order.billable_inboxes,
												args: {
													inboxes: order.billable_inboxes,
												},
												comment: '%(inboxes)s is the number of email inboxes.',
											} ) }
										</div>
									</div>
								) ) }
							</div>
						</div>
					</div>
				</div>
			) }
		</div>
	);
}
