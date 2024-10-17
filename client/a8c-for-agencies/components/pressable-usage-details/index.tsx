import formatNumber, {
	DEFAULT_LOCALE,
	STANDARD_FORMATTING_OPTIONS,
} from '@automattic/components/src/number-formatters/lib/format-number';
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

	if ( ! planUsage || ! planInfo ) {
		return null;
	}

	return (
		<div className="pressable-usage-details__card">
			<div className="pressable-usage-details__info">
				<div className="pressable-usage-details__info-item">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">{ translate( 'Storage' ) }</div>
						<div className="pressable-usage-details__info-top-right">
							Using { planUsage.storage_gb } of { planInfo.storage } GB
						</div>
					</div>
					<div className="pressable-usage-details__info-value">[ Progress-bar ]</div>
				</div>
			</div>

			<div className="pressable-usage-details__info">
				<div className="pressable-usage-details__info-item sites">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">{ translate( 'Sites' ) }</div>
						<div className="pressable-usage-details__info-top-right">
							{ planInfo.install } { translate( 'maximum of sites' ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						{ planUsage.sites_count } { translate( 'installed sites' ) }
					</div>
				</div>

				<div className="pressable-usage-details__info-item visits">
					<div className="pressable-usage-details__info-header">
						<div className="pressable-usage-details__info-label">{ translate( 'Visits' ) }</div>
						<div className="pressable-usage-details__info-top-right">
							{ formatNumber( planInfo.visits, DEFAULT_LOCALE, STANDARD_FORMATTING_OPTIONS ) }
							{ translate( 'per month' ) }
						</div>
					</div>
					<div className="pressable-usage-details__info-value">
						{ formatNumber( planUsage.visits_count ) } { translate( 'visits this month' ) }
					</div>
				</div>
			</div>
		</div>
	);
}
