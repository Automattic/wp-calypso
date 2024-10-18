import { ProgressBar } from '@automattic/components';
import formatNumber, {
	DEFAULT_LOCALE,
	STANDARD_FORMATTING_OPTIONS,
} from '@automattic/components/src/number-formatters/lib/format-number';
import { useTranslate } from 'i18n-calypso';
//import { useSelector } from 'react-redux';
import getPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';
//import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

type Props = {
	existingPlan: APIProductFamilyProduct | null;
};

export default function PressableUsageDetails( { existingPlan }: Props ) {
	const translate = useTranslate();
	// @todo (dev-testing mode) => Before merge, get the plan usage from the agency object instead of mocked one
	// const agency = useSelector( getActiveAgency );
	// const planUsage = agency?.third_party?.pressable?.usage;
	const planUsage = {
		storage_gb: 20,
		sites_count: 2,
		visits_count: 12589,
	};

	const planInfo = existingPlan?.slug ? getPressablePlan( existingPlan?.slug ) : null;

	if ( ! planUsage || ! planInfo ) {
		return null;
	}

	return (
		<div className="pressable-usage-details__card">
			<div className="pressable-usage-details__info">
				<div className="pressable-usage-details__info-item">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">{ translate( 'Storage' ) }</div>
						<div className="pressable-usage-details__info-top-right storage">
							{ translate( 'Using %(used_storage)d of %(max_storage)d GB', {
								args: {
									used_storage: planUsage.storage_gb,
									max_storage: planInfo.storage,
								},
								comment: '%(used_storage)d and %(max_storage)d are the storage values in GB.',
							} ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						<ProgressBar
							className="pressable-usage-details__storage-bar"
							compact
							value={ planUsage.storage_gb }
							total={ planInfo.storage }
						/>
					</div>
				</div>
			</div>

			<div className="pressable-usage-details__info">
				<div className="pressable-usage-details__info-item sites">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">{ translate( 'Sites' ) }</div>
						<div className="pressable-usage-details__info-top-right">
							{ translate( 'up to %(max_sites)d sites', {
								args: {
									max_sites: planInfo.install,
								},
								comment: '%(max_sites)d is the maximum number of sites.',
							} ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						{ translate( '%(total_sites)d installed sites', {
							args: {
								total_sites: planUsage.sites_count,
							},
							comment: '%(total_sites)d is the number of installed sites.',
						} ) }
					</div>
				</div>

				<div className="pressable-usage-details__info-item visits">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">{ translate( 'Visits' ) }</div>
						<div className="pressable-usage-details__info-top-right">
							{ translate( '%(max_visits)s per month', {
								args: {
									max_visits: formatNumber(
										planInfo.visits,
										DEFAULT_LOCALE,
										STANDARD_FORMATTING_OPTIONS
									),
								},
								comment: '%(max_visits)s is the number of traffic visits of the site.',
							} ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						{ translate( '%(visits_count)s visits this month', {
							args: {
								visits_count: formatNumber(
									planUsage.visits_count,
									DEFAULT_LOCALE,
									STANDARD_FORMATTING_OPTIONS
								),
							},
							comment: '%(visits_count)s is the number of month visits of the site.',
						} ) }
					</div>
				</div>
			</div>
		</div>
	);
}
