import { Button, CircularProgressBar, Gridicon } from '@automattic/components';
import {
	TemporaryDismiss,
	useLaunchpadDismisser,
	useSortedLaunchpadTasks,
} from '@automattic/data-stores';
import { Launchpad, type Task } from '@automattic/launchpad';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { type FC } from 'react';
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

	const hasChecklist = checklist !== undefined && checklist !== null;
	const launchpadTitle = hasChecklist ? title ?? translate( 'Next steps for your site' ) : ' ';
	const headerClasses = clsx( 'customer-home-launchpad__header', {
		'is-placeholder': ! hasChecklist,
	} );

	const temporaryDismiss = ( { dismissBy }: Pick< TemporaryDismiss, 'dismissBy' > ) => {
		dismiss( {
			dismissBy,
		} );
	};

	const permanentDismiss = () => dismiss( { isDismissed: true } );

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
								<div> { translate( 'Dismiss guide' ) } </div>
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
				onSiteLaunched={ onSiteLaunched }
			/>
		</div>
	);
};

export default CustomerHomeLaunchpad;
