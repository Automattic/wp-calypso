import { Button } from '@wordpress/components';
import { layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function OverviewSidebarRelaunchWelcomeTour() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleRelaunchWelcomeTour = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_overview_relaunch_welcome_tour_click' ) );
		// TODO: Implement the relaunch welcome tour
	};

	return (
		<Button
			className="overview__relaunch-welcome-tour"
			variant="secondary"
			icon={ layout }
			onClick={ handleRelaunchWelcomeTour }
		>
			{ translate( 'Relaunch welcome tour' ) }
		</Button>
	);
}
