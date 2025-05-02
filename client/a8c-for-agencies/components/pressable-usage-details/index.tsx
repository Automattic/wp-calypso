import { ProgressBar } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

type Props = {
	existingPlan: APIProductFamilyProduct | null;
};

export default function PressableUsageDetails( { existingPlan }: Props ) {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const planUsage = agency?.third_party?.pressable?.usage;

	const planInfo = existingPlan?.slug ? getPressablePlan( existingPlan?.slug ) : null;

	if ( ! planInfo ) {
		return null;
	}

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
										max_storage: planInfo.storage,
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
							total={ planInfo.storage }
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
									max_sites: planInfo.install,
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
							total={ planInfo.install }
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
									max_visits: formatNumber( planInfo.visits ),
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
							total={ planInfo.visits }
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
