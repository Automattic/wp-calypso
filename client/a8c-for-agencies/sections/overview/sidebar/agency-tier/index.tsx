import { Card, FoldableCard } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, arrowRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import getAgencyTierInfo from 'calypso/a8c-for-agencies/sections/agency-tier/lib/get-agency-tier-info';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import AgencyTierCelebrationModal from './celebration-modal';

import './style.scss';

export default function OverviewSidebarAgencyTier() {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );

	const currentAgencyTier = agency?.tier?.id;
	const currentAgencyTierInfo =
		currentAgencyTier && getAgencyTierInfo( currentAgencyTier, translate );

	if ( ! currentAgencyTierInfo ) {
		return null;
	}

	return (
		<>
			<AgencyTierCelebrationModal
				agencyTierInfo={ currentAgencyTierInfo }
				currentAgencyTier={ currentAgencyTier }
			/>
			<Card className="agency-tier__card">
				<FoldableCard
					className="foldable-nav"
					header={ translate( 'Your Agency Tier' ) }
					expanded
					compact
					iconSize={ 18 }
				>
					<div className="agency-tier__bottom-content">
						<div className="agency-tier__current-agency-tier-header">
							<span className="agency-tier__current-agency-tier-icon">
								<img src={ currentAgencyTierInfo.logo } alt={ currentAgencyTierInfo.id } />
							</span>
							<span className="agency-tier__current-agency-tier-title">
								{ currentAgencyTierInfo.title }
							</span>
						</div>
						{ currentAgencyTierInfo && (
							<div className="agency-tier__current-agency-tier-description">
								{ currentAgencyTierInfo.description }
							</div>
						) }
						<Button href={ A4A_AGENCY_TIER_LINK }>
							<Icon icon={ arrowRight } size={ 18 } />
							{ translate( 'Explore tiers and benefits' ) }
						</Button>
					</div>
				</FoldableCard>
			</Card>
		</>
	);
}
