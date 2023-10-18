import { CircularProgressBar } from '@automattic/components';
import { Launchpad, Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getConnectUrlForSiteId } from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type EarnLaunchpadProps = {
	numberOfSteps: number;
	completedSteps: number;
};

const EarnLaunchpad = ( { numberOfSteps, completedSteps }: EarnLaunchpadProps ) => {
	const translate = useTranslate();

	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const stripeConnectUrl = useSelector( ( state ) =>
		getConnectUrlForSiteId( state, site?.ID ?? 0 )
	);

	const taskFilter = ( tasks: Task[] ): Task[] => {
		if ( ! tasks ) {
			return [];
		}

		return tasks.map( ( task ) => {
			switch ( task.id ) {
				case 'stripe_connected':
					return {
						...task,
						actionDispatch: () => {
							window.location.assign( stripeConnectUrl );
						},
					};
				case 'paid_offer_created':
					return {
						...task,
						actionDispatch: () => {
							window.location.assign(
								`/earn/payments-plans/${ site?.slug }?launchpad=add-product#add-newsletter-payment-plan`
							);
						},
					};
				default:
					return task;
			}
		} );
	};

	return (
		<div className="earn__launchpad">
			<div className="earn__launchpad-header">
				<div className="earn__launchpad-progress-bar-container">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						numberOfSteps={ numberOfSteps }
						currentStep={ completedSteps }
					/>
				</div>
				<h2 className="earn__launchpad-title">
					{ translate( 'Create your paid offering in two steps.' ) }
				</h2>
				<p className="earn__launchpad-description">
					{ translate( 'Let your fans support your art, writing, or project directly.' ) }
				</p>
			</div>
			<Launchpad siteSlug={ site?.slug ?? null } checklistSlug="earn" taskFilter={ taskFilter } />
		</div>
	);
};

export default EarnLaunchpad;
