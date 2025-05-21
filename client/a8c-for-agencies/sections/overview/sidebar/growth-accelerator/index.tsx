import { Card } from '@automattic/components';
import { Button, Icon } from '@wordpress/components';
import { external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useFetchScheduleCallLink from 'calypso/a8c-for-agencies/data/agencies/use-fetch-schedule-call-link';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

const GROWTH_ACCELERATOR_REQUESTED_PREFERENCE = 'a4a_growth_accelerator_requested';
const GROWTH_ACCELERATOR_DISMISSED_PREFERENCE = 'a4a_growth_accelerator_dismissed';

export default function OverviewSidebarGrowthAccelerator() {
	const translate = useTranslate();

	const dispatch = useDispatch();

	const { refetch: fetchScheduleCallLink, isFetching: isFetchingScheduleCallLink } =
		useFetchScheduleCallLink();

	const onRequestCallClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_growth_accelerator_schedule_call_click' ) );
		dispatch( savePreference( GROWTH_ACCELERATOR_REQUESTED_PREFERENCE, true ) );

		fetchScheduleCallLink().then( ( result ) => {
			window.open(
				result.data
					? result.data
					: 'https://meetings.hubspot.com/automattic-for-agencies/discovery-meeting',
				'_blank'
			);
		} );
	}, [ dispatch, fetchScheduleCallLink ] );

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
				<Button
					className="overview__growth-accelerator-footer-schedule-call"
					variant="primary"
					disabled={ isFetchingScheduleCallLink }
					isBusy={ isFetchingScheduleCallLink }
					onClick={ onRequestCallClick }
				>
					{ translate( 'Schedule a call' ) }
					<Icon icon={ external } size={ 16 } />
				</Button>
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
