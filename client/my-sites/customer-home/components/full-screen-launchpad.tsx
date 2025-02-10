import { CircularProgressBar, ConfettiAnimation } from '@automattic/components';
import { updateLaunchpadSettings, useSortedLaunchpadTasks } from '@automattic/data-stores';
import { wpcomRequest } from '@automattic/data-stores/src/wpcom-request-controls';
import { Launchpad, Task } from '@automattic/launchpad';
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
		onClose();

		await wpcomRequest( {
			path: `/sites/${ siteSlug }/launch`,
			apiVersion: '1.1',
			method: 'post',
		} );

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

	const {
		data: { checklist },
	} = useSortedLaunchpadTasks( siteSlug, checklistSlug, launchpadContext );

	if ( isDismissed ) {
		return null;
	}

	const launchSiteTask = checklist?.find( ( task: Task ) =>
		[ 'site_launched', 'blog_launched', 'link_in_bio_launched' ].includes( task.id )
	);

	const isAllTasksCompleted =
		hasChecklist &&
		numberOfSteps > 0 &&
		completedSteps >= numberOfSteps - ( launchSiteTask ? 1 : 0 );

	return (
		<div className="is-launchpad-first" css={ { width: '100%' } }>
			<div
				className={ `customer-home-launchpad customer-home__card is-small-hero ${
					isAllTasksCompleted ? 'all-tasks-completed' : ''
				}` }
			>
				<div className="customer-home__launchpad-header">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						numberOfSteps={ numberOfSteps - ( launchSiteTask ? 1 : 0 ) }
						currentStep={ completedSteps }
					/>
					<h2>{ ! isAllTasksCompleted ? __( "Let's get started!" ) : __( "You're all set!" ) }</h2>
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
				<div className="launchpad-actions">
					{ launchSiteTask && isAllTasksCompleted && (
						<Button onClick={ onSkipLaunchpad } className="launchpad-site-launch" variant="primary">
							{ launchSiteTask?.title }
						</Button>
					) }
					<Button onClick={ onSkipLaunchpad }>{ __( 'Skip to dashboard' ) }</Button>
				</div>
			</div>
		</div>
	);
};
