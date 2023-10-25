import { useLaunchpad } from '@automattic/data-stores';
import { Task } from '@automattic/launchpad';
import { useSelector } from 'calypso/state';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { getConnectedAccountIdForSiteId } from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const useEarnLaunchpadTasks = () => {
	const checklistSlug = 'earn';
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const { products, connectedAccountId } = useSelector( ( state ) => ( {
		products: getProductsForSiteId( state, site?.ID ),
		connectedAccountId: getConnectedAccountIdForSiteId( state, site?.ID ),
	} ) );

	const {
		data: { checklist },
	} = useLaunchpad( site?.slug ?? null, checklistSlug );

	const taskFilter = ( tasks: Task[] ): Task[] => {
		if ( ! tasks ) {
			return [];
		}

		// Override the `completed` value for tasks where the back end site may
		// not have the correct values available.
		return tasks.map( ( task ) => {
			switch ( task.id ) {
				case 'stripe_connected':
					return {
						...task,
						completed: Boolean( connectedAccountId ),
					};
				case 'paid_offer_created':
					return {
						...task,
						completed: Boolean( products && products.length > 0 ),
					};
				default:
					return task;
			}
		} );
	};

	const enhancedChecklist = checklist ? taskFilter( checklist ) : [];
	const numberOfSteps = enhancedChecklist.length;
	const completedSteps = enhancedChecklist.filter( ( task ) => task.completed ).length;
	const tasklistCompleted = completedSteps >= numberOfSteps;
	const shouldLoad = ! tasklistCompleted && numberOfSteps > 0;

	return {
		checklistSlug,
		taskFilter,
		numberOfSteps,
		completedSteps,
		shouldLoad,
	};
};
