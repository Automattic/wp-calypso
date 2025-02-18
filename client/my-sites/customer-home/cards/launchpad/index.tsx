import { Button, CircularProgressBar, Gridicon } from '@automattic/components';
import { Launchpad } from '@automattic/launchpad';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { type FC } from 'react';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useLaunchpad } from './use-launchpad';
import { useLaunchpadContext } from './utils';
import './style.scss';

interface CustomerHomeLaunchpadProps {
	checklistSlug: string;
	onSiteLaunched?: () => void;
}

const CustomerHomeLaunchpad: FC< CustomerHomeLaunchpadProps > = ( {
	checklistSlug,
	onSiteLaunched,
}: CustomerHomeLaunchpadProps ) => {
	const launchpadContext = useLaunchpadContext();
	const translate = useTranslate();

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
	} = useLaunchpad( { checklistSlug, launchpadContext } );

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
				onSiteLaunched={ onSiteLaunched }
			/>
		</div>
	);
};

export default CustomerHomeLaunchpad;
