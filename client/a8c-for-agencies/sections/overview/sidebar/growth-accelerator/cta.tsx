import { Button } from '@wordpress/components';
import { external, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { GROWTH_ACCELERATOR_REQUESTED_PREFERENCE } from '.';

type Props = {
	className?: string;
	onRequestSuccess?: () => void;
};

export default function OverviewSidebarGrowthAcceleratorCta( {
	className,
	onRequestSuccess,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { scheduleCall, isLoading: isFetchingScheduleCallLink } = useScheduleCall( {
		onSuccess: onRequestSuccess,
	} );

	const onRequestCallClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_growth_accelerator_schedule_call_click' ) );
		dispatch( savePreference( GROWTH_ACCELERATOR_REQUESTED_PREFERENCE, true ) );
		scheduleCall();
	}, [ dispatch, scheduleCall ] );

	return (
		<Button
			className={ clsx( 'overview__growth-accelerator-footer-schedule-call', className ) }
			variant="primary"
			disabled={ isFetchingScheduleCallLink }
			isBusy={ isFetchingScheduleCallLink }
			onClick={ onRequestCallClick }
		>
			{ translate( 'Schedule a call' ) }
			<Icon icon={ external } size={ 16 } />
		</Button>
	);
}
