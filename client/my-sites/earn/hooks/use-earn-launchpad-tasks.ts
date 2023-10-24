import { useLaunchpad } from '@automattic/data-stores';
import { Task } from '@automattic/launchpad';
import { useSelector } from 'calypso/state';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import {
	getConnectUrlForSiteId,
	getConnectedAccountIdForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const useEarnLaunchpadTasks = () => {
	const checklistSlug = 'earn';
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const { products, connectedAccountId, stripeConnectUrl } = useSelector( ( state ) => ( {
		products: getProductsForSiteId( state, site?.ID ),
		connectedAccountId: getConnectedAccountIdForSiteId( state, site?.ID ),
		stripeConnectUrl: getConnectUrlForSiteId( state, site?.ID ?? 0 ),
	} ) );

	const {
		data: { checklist },
	} = useLaunchpad( site?.slug ?? null, checklistSlug );

	const taskFilter = ( tasks: Task[] | null | undefined ): Task[] => {
		if ( ! tasks ) {
			return [];
		}

		return tasks.map( ( task ) => {
			switch ( task.id ) {
				case 'stripe_connected':
					return {
						...task,
						completed: Boolean( connectedAccountId ),
						actionDispatch: () => {
							window.location.assign( stripeConnectUrl );
						},
					};
				case 'paid_offer_created':
					return {
						...task,
						completed: Boolean( products && products.length > 0 ),
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

	const enhancedChecklist = taskFilter( checklist );
	const numberOfSteps = enhancedChecklist?.length || 0;
	const completedSteps = ( enhancedChecklist?.filter( ( task ) => task.completed ) || [] ).length;
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
