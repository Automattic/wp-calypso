import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
//import getPressableShortName from '../lib/get-pressable-short-name';

import './style.scss';

type Props = {
	existingPlan: APIProductFamilyProduct | null;
};

export default function PressableUsageDetails( { existingPlan }: Props ) {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const planUsage = agency?.third_party?.pressable?.usage;

	const planInfo = existingPlan?.slug ? getPressablePlan( existingPlan?.slug ) : null;

	return (
		<div className="plan-card">
			{ planUsage && planInfo && (
				<>
					<div className="plan-storage">
						<p className="storage-label">{ translate( 'Storage' ) } </p>
					</div>

					<div className="plan-info">
						<div className="info-item sites">
							<div className="info-header">
								<p className="info-label">{ translate( 'Sites' ) }</p>
								<p className="info-top-right">
									{ planInfo.install } { translate( 'maximum of sites' ) }
								</p>
							</div>
							<p className="info-value">
								{ planUsage.sites_count } { translate( 'installed sites' ) }
							</p>
						</div>

						<div className="info-item visits">
							<div className="info-header">
								<p className="info-label">{ translate( 'Visits' ) }</p>
								<p className="info-top-right">
									{ formatNumber( planInfo.visits ) } { translate( 'per month' ) }
								</p>
							</div>
							<p className="info-value">
								{ formatNumber( planUsage.visits_count ) } { translate( 'visits this month' ) }
							</p>
						</div>
					</div>
				</>
			) }
		</div>
	);
}
