import { Button, CircularProgressBar, Gridicon } from '@automattic/components';
import { useLaunchpadDismisser, useSortedLaunchpadTasks } from '@automattic/data-stores';
import { Launchpad, type Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import moment, { Duration } from 'moment';
import { FC } from 'react';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

import './style.scss';
interface CustomerHomeLaunchpadProps {
	checklistSlug: string;
	onSiteLaunched?: () => void;
}

const CustomerHomeLaunchpad: FC< CustomerHomeLaunchpadProps > = ( {
	checklistSlug,
	onSiteLaunched,
}: CustomerHomeLaunchpadProps ) => {
	const launchpadContext = 'customer-home';
	const siteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) || '' );

	const { mutate: dismiss } = useLaunchpadDismisser( siteSlug, checklistSlug );

	const {
		data: { checklist, is_dismissed: isDismissed, is_dismissible: isDismissible, title },
	} = useSortedLaunchpadTasks( siteSlug, checklistSlug, launchpadContext );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;

	// return nothing if the launchpad is dismissed
	if ( isDismissed ) {
		return null;
	}

	const temporaryDismiss = ( duration: Duration ) => {
		dismiss( {
			dismissedUntil: moment().add( duration ).utc().unix(),
		} );
	};

	const permanentDismiss = () => dismiss( { isDismissed: true } );

	return (
		<div className="customer-home-launchpad">
			<div className="customer-home-launchpad__header">
				<h2 className="customer-home-launchpad__title">
					{ title ?? translate( 'Next steps for your site' ) }
				</h2>
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
								<PopoverMenuItem onClick={ () => temporaryDismiss( moment.duration( 1, 'days' ) ) }>
									{ translate( 'Hide for a day' ) }
								</PopoverMenuItem>
								<PopoverMenuItem
									onClick={ () => temporaryDismiss( moment.duration( 1, 'weeks' ) ) }
								>
									{ translate( 'Hide for a week' ) }
								</PopoverMenuItem>
								<PopoverMenuItem onClick={ permanentDismiss }>
									{ translate( 'Hide forever' ) }
								</PopoverMenuItem>
							</EllipsisMenu>
						) }
					</div>
				) : (
					<div className="customer-home-launchpad__dismiss-button">
						<Button
							className="themes__activation-modal-close-icon"
							borderless
							onClick={ permanentDismiss }
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
