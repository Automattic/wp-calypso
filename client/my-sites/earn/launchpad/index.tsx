import { CircularProgressBar } from '@automattic/components';
import { Launchpad, Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { getConnectedAccountIdForSiteId } from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { Product } from '../types';

type EarnLaunchpadProps = {
	numberOfSteps: number;
	completedSteps: number;
};

const EarnLaunchpad = ( { numberOfSteps, completedSteps }: EarnLaunchpadProps ) => {
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const products: Product[] = useSelector( ( state ) => getProductsForSiteId( state, site?.ID ) );
	const connectedAccountId = useSelector( ( state ) =>
		getConnectedAccountIdForSiteId( state, site?.ID )
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
						is_complete: !! connectedAccountId,
					};
				case 'paid_offer_created':
					return {
						...task,
						is_complete: !! ( products && products.length > 0 ),
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
