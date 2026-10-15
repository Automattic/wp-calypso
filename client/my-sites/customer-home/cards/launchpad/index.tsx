import { Button, CircularProgressBar, Gridicon } from '@automattic/components';
import { Launchpad } from '@automattic/launchpad';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, type FC } from 'react';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PreLaunchSiteModal from 'calypso/components/pre-launch-site-modal';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useMyHomeCardLaunchpad } from './use-my-home-card-launchpad';
import './style.scss';
import type { EventHandlers, Task } from '@automattic/launchpad';
import type { AppState } from 'calypso/types';

const LAUNCH_TASK_IDS = [ 'site_launched', 'blog_launched' ];

interface CustomerHomeLaunchpadProps extends Pick< EventHandlers, 'onTaskClick' > {
	checklistSlug: string;
}

const CustomerHomeLaunchpad: FC< CustomerHomeLaunchpadProps > = ( props ) => {
	const { checklistSlug, onTaskClick } = props;
	const launchpadContext = 'customer-home';
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) || 0;
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const [ isLaunchModalOpen, setIsLaunchModalOpen ] = useState( false );

	const {
		siteSlug,
		isDismissed,
		isDismissible,
		numberOfSteps,
		completedSteps,
		hasChecklist,
		launchpadTitle,
		temporaryDismiss,
		permanentDismiss,
	} = useMyHomeCardLaunchpad( { checklistSlug, launchpadContext } );

	const launchUrl = addQueryArgs( '/start/launch-site', { siteSlug } );

	// A free site can never qualify for the pre-launch modal (needs a paid plan),
	// so skip the bridge and redirect instantly. Unknown plans settle in the bridge.
	const isFreePlan = site?.plan?.is_free ?? false;

	// Launch tasks never launch in place: they go through the pre-launch bridge,
	// which either confirms first or hands off to the launch flow.
	const handleTaskClick = ( task: Task ) => {
		if ( onTaskClick?.( task ) === false ) {
			return false;
		}

		if ( ! LAUNCH_TASK_IDS.includes( task.id ) ) {
			return;
		}

		if ( isFreePlan ) {
			window.location.assign( launchUrl );
			return false;
		}

		setIsLaunchModalOpen( true );
		return false;
	};

	// return nothing if the launchpad is dismissed
	if ( isDismissed ) {
		return null;
	}

	const headerClasses = clsx( 'customer-home-launchpad__header', {
		'is-placeholder': ! hasChecklist,
	} );

	return (
		<div className="customer-home-launchpad customer-home__card is-small-hero">
			<div className={ headerClasses }>
				<h2 className="customer-home-launchpad__title">{ launchpadTitle }</h2>
				{ numberOfSteps > completedSteps ? (
					<div className="customer-home-launchpad__progress-bar-container">
						<CircularProgressBar
							size={ 40 }
							enableDesktopScaling
							numberOfSteps={ numberOfSteps }
							currentStep={ completedSteps }
						/>
						{ isDismissible && (
							<EllipsisMenu position="bottom" toggleTitle={ translate( 'Dismiss settings' ) }>
								<PopoverMenuItem onClick={ () => temporaryDismiss( { dismissBy: '+ 1 day' } ) }>
									{ translate( 'Hide for a day' ) }
								</PopoverMenuItem>
								<PopoverMenuItem onClick={ () => temporaryDismiss( { dismissBy: '+ 1 week' } ) }>
									{ translate( 'Hide for a week' ) }
								</PopoverMenuItem>
								<PopoverMenuItem onClick={ permanentDismiss }>
									{ translate( 'Hide forever' ) }
								</PopoverMenuItem>
							</EllipsisMenu>
						) }
					</div>
				) : (
					hasChecklist && (
						<div className="customer-home-launchpad__dismiss-button">
							<Button
								className="themes__activation-modal-close-icon"
								borderless
								onClick={ permanentDismiss }
							>
								<div>{ translate( 'Dismiss guide' ) }</div>
								<Gridicon icon="cross" size={ 12 } />
							</Button>
						</div>
					)
				) }
			</div>
			<Launchpad
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				launchpadContext={ launchpadContext }
				onTaskClick={ handleTaskClick }
			/>
			{ ! isFreePlan && (
				<PreLaunchSiteModal
					siteId={ siteId }
					isOpen={ isLaunchModalOpen }
					onClose={ () => setIsLaunchModalOpen( false ) }
					launchUrl={ launchUrl }
				/>
			) }
		</div>
	);
};

export default CustomerHomeLaunchpad;
