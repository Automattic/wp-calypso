import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import OverviewSidebarAgencyTier from './agency-tier';
import OverviewSidebarContactSupport from './contact-support';
import OverviewSidebarFeaturedWooPayments from './featured-woopayments';
import OverviewSidebarGrowthAccelerator from './growth-accelerator';
import OverviewSidebarQuickLinks from './quick-links';
import OverviewSidebarRelaunchWelcomeTour from './relaunch-welcome-tour';

import './style.scss';

const OverviewSidebar = () => {
	const isNewArrangement = isEnabled( 'a4a-unified-onboarding-tour' );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onProgramIncentiveClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_program_incentive_click' ) );
	}, [ dispatch ] );

	return (
		<div className="overview-sidebar">
			{ isNewArrangement && (
				<>
					<OverviewSidebarRelaunchWelcomeTour />
					<OverviewSidebarGrowthAccelerator />
				</>
			) }
			{ isEnabled( 'a8c-for-agencies-agency-tier' ) && <OverviewSidebarAgencyTier /> }
			{ ! isNewArrangement && <OverviewSidebarQuickLinks /> }
			<OverviewSidebarFeaturedWooPayments />
			{ ! isNewArrangement && <OverviewSidebarGrowthAccelerator /> }
			<OverviewSidebarContactSupport />
			<Button
				className="overview__sidebar-button"
				onClick={ onProgramIncentiveClick }
				href="https://automattic.com/for-agencies/program-incentives/"
				target="_blank"
				rel="noopener noreferrer"
			>
				{ translate( 'Program incentive details' ) }
			</Button>
		</div>
	);
};

export default OverviewSidebar;
