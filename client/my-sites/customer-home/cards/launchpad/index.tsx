import { Button, CircularProgressBar, Gridicon } from '@automattic/components';
import {
	updateLaunchpadSettings,
	LaunchpadNavigator,
<<<<<<< HEAD
	useSortedLaunchpadTasks,
=======
	useLaunchpadNavigator,
>>>>>>> 1bc24b64dd (Fixes the Luanchpad navigator ring)
} from '@automattic/data-stores';
import { Launchpad, type Task } from '@automattic/launchpad';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

import './style.scss';

interface CustomerHomeLaunchpadProps {
	checklistSlug: string;
	onSiteLaunched?: () => void;
}

const CustomerHomeLaunchpad = ( {
	checklistSlug,
	onSiteLaunched,
}: CustomerHomeLaunchpadProps ): JSX.Element => {
	const launchpadContext = 'customer-home';
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );

	const translate = useTranslate();
	const [ isDismissed, setIsDismissed ] = useState( false );
	const {
		data: { checklist, is_dismissed: initialIsChecklistDismissed },
	} = useSortedLaunchpadTasks( siteSlug, checklistSlug );

	useEffect( () => {
		setIsDismissed( initialIsChecklistDismissed );
	}, [ initialIsChecklistDismissed ] );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;

	const { setActiveChecklist, receiveActiveChecklistSlug } = useDispatch(
		LaunchpadNavigator.store
	);

	const {
		data: { current_checklist: currentNavigatorChecklist },
	} = useLaunchpadNavigator( siteSlug, null );

	// Ensure that if we updated the checklist on the server, we update the navigator.
	// One case where this can happen is when we launch a site and switch to a post-launch checklist.
	useEffect( () => {
		receiveActiveChecklistSlug( currentNavigatorChecklist );

		if ( siteSlug && checklistSlug ) {
			setActiveChecklist( siteSlug, checklistSlug );
		}
	}, [
		checklistSlug,
		currentNavigatorChecklist,
		receiveActiveChecklistSlug,
		setActiveChecklist,
		siteSlug,
	] );

	// return nothing if the launchpad is dismissed
	if ( isDismissed ) {
		return <></>;
	}

	return (
		<div className="customer-home-launchpad">
			<div className="customer-home-launchpad__header">
				<h2 className="customer-home-launchpad__title">
					{ translate( 'Next steps for your site' ) }
				</h2>
				{ numberOfSteps > completedSteps ? (
					<div className="customer-home-launchpad__progress-bar-container">
						<CircularProgressBar
							size={ 40 }
							enableDesktopScaling
							numberOfSteps={ numberOfSteps }
							currentStep={ completedSteps }
						/>
					</div>
				) : (
					<div className="customer-home-launchpad__dismiss-button">
						<Button
							className="themes__activation-modal-close-icon"
							borderless
							onClick={ () => {
								if ( ! siteSlug ) {
									return;
								}

								updateLaunchpadSettings( siteSlug, {
									is_checklist_dismissed: {
										slug: checklistSlug,
										is_dismissed: true,
									},
								} );
								setIsDismissed( true );

								recordTracksEvent( 'calypso_launchpad_dismiss_guide', {
									checklist_slug: checklistSlug,
									context: 'customer-home',
								} );
							} }
						>
							<div> { translate( 'Dismiss guide' ) } </div>
							<Gridicon icon="cross" size={ 12 } />
						</Button>
					</div>
				) }
			</div>
			<Launchpad
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				launchpadContext={ launchpadContext }
				onSiteLaunched={ onSiteLaunched }
			/>
		</div>
	);
};

export default CustomerHomeLaunchpad;
