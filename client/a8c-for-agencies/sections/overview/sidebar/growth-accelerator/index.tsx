import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import OverviewSidebarGrowthAcceleratorCta from './cta';

import './style.scss';

export const GROWTH_ACCELERATOR_REQUESTED_PREFERENCE = 'a4a_growth_accelerator_requested';
export const GROWTH_ACCELERATOR_DISMISSED_PREFERENCE = 'a4a_growth_accelerator_dismissed';

export default function OverviewSidebarGrowthAccelerator() {
	const translate = useTranslate();

	const dispatch = useDispatch();

	const onNotInterestedClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_growth_accelerator_not_interested_click' ) );
		dispatch( savePreference( GROWTH_ACCELERATOR_DISMISSED_PREFERENCE, true ) );
	}, [ dispatch ] );

	const isDismissed = useSelector( ( state ) =>
		getPreference( state, GROWTH_ACCELERATOR_DISMISSED_PREFERENCE )
	);

	const hasRequested = useSelector( ( state ) =>
		getPreference( state, GROWTH_ACCELERATOR_REQUESTED_PREFERENCE )
	);

	if ( isDismissed ) {
		return null;
	}

	return (
		<Card className="overview__growth-accelerator">
			<h2 className="overview__growth-accelerator-header">
				{ translate( 'Accelerate your agency’s growth' ) }
			</h2>

			<p className="overview__growth-accelerator-body">
				{ translate(
					'Schedule a call with the Automattic for Agencies team to help us understand your business better and help you find and retain more clients.'
				) }
			</p>

			<div className="overview__growth-accelerator-footer">
				<OverviewSidebarGrowthAcceleratorCta />
				<Button
					className="overview__growth-accelerator-footer-not-interested"
					variant="link"
					onClick={ onNotInterestedClick }
				>
					{ hasRequested ? translate( 'Dismiss' ) : translate( "I'm not interested" ) }
				</Button>
			</div>
		</Card>
	);
}
