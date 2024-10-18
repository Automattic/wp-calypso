import { ProgressBar } from '@automattic/components';
import formatNumber, {
	DEFAULT_LOCALE,
	STANDARD_FORMATTING_OPTIONS,
} from '@automattic/components/src/number-formatters/lib/format-number';
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
						<div className="pressable-usage-details__info-label">{ translate( 'Storage' ) }</div>
						<div className="pressable-usage-details__info-top-right storage">
							{ planUsage &&
								translate( 'Using %(used_storage)s of %(max_storage)s GB', {
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
						<div className="pressable-usage-details__info-label">{ translate( 'Sites' ) }</div>
						<div className="pressable-usage-details__info-top-right">
							{ translate( 'up to %(max_sites)s sites', {
								args: {
									max_sites: planInfo.install,
								},
								comment: '%(max_sites)s is the maximum number of sites.',
							} ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						{ planUsage &&
							translate( '%(total_sites)s installed sites', {
								args: {
									total_sites: planUsage.sites_count,
								},
								comment: '%(total_sites)s is the number of installed sites.',
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
						{ planUsage &&
							translate( '%(visits_count)s visits this month', {
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
