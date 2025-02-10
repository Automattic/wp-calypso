import { CircularProgressBar, ConfettiAnimation } from '@automattic/components';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { Launchpad } from '@automattic/launchpad';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import { useLaunchpad } from '../cards/launchpad/use-launchpad';
import './full-screen-launchpad.scss';

export const FullScreenLaunchpad = ( { onClose }: { onClose: () => void } ): JSX.Element | null => {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = site?.options?.site_intent ?? '';
	const layout = useHomeLayoutQuery( siteId || null );

	const launchpadContext = 'customer-home';

	const {
		siteSlug,
		isDismissed,
		numberOfSteps,
		completedSteps,
		launchpadTitle,
		hasChecklist,
		refetch,
	} = useLaunchpad( {
		checklistSlug,
		launchpadContext,
	} );

	const onSiteLaunched = async () => {
		await updateLaunchpadSettings( siteId, {
			checklist_statuses: { site_launched: true },
		} );

		await refetch?.();
		layout?.refetch();
		dispatch( requestSite( siteId ) );
	};

	const onSkipLaunchpad = async () => {
		onClose();

		await skipLaunchpad( {
			siteId,
			siteSlug,
			redirectToHome: false,
		} );

		dispatch( requestSite( siteId ) );
	};

	if ( isDismissed ) {
		return null;
	}

	const isAllTasksCompleted = hasChecklist && numberOfSteps > 0 && completedSteps === numberOfSteps;

	return (
		<div css={ { display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
			<div className="is-launchpad-first" css={ { width: '100%' } }>
				<div className="customer-home-launchpad customer-home__card is-small-hero">
					<div className="customer-home__launchpad-header">
						<CircularProgressBar
							size={ 40 }
							enableDesktopScaling
							numberOfSteps={ numberOfSteps }
							currentStep={ completedSteps }
						/>
						<h2>
							{ ! isAllTasksCompleted ? __( "Let's get started!" ) : __( "You're all set!" ) }
						</h2>
						<span>{ ! isAllTasksCompleted && launchpadTitle }</span>
					</div>
					{ isAllTasksCompleted && <ConfettiAnimation /> }
					<Launchpad
						siteSlug={ siteSlug }
						checklistSlug={ checklistSlug }
						launchpadContext={ launchpadContext }
						onSiteLaunched={ onSiteLaunched }
						highlightNextAction
					/>
				</div>
			</div>
			<Button onClick={ onSkipLaunchpad } variant={ isAllTasksCompleted ? 'primary' : undefined }>
				{ isAllTasksCompleted ? __( 'Explore dashboard' ) : __( 'Skip to dashboard' ) }
			</Button>
		</div>
	);
};
