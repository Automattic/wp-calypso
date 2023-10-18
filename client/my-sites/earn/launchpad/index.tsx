import { CircularProgressBar } from '@automattic/components';
import { Launchpad, Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import { useSelector } from 'calypso/state';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import {
	getConnectUrlForSiteId,
	getConnectedAccountIdForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type EarnLaunchpadProps = {
	numberOfSteps: number;
	completedSteps: number;
};

const EarnLaunchpad = ( { numberOfSteps, completedSteps }: EarnLaunchpadProps ) => {
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const { products, connectedAccountId, stripeConnectUrl } = useSelector( ( state ) => ( {
		products: getProductsForSiteId( state, site?.ID ),
		connectedAccountId: getConnectedAccountIdForSiteId( state, site?.ID ),
		stripeConnectUrl: getConnectUrlForSiteId( state, site?.ID ?? 0 ),
	} ) );

	const taskFilter = ( tasks: Task[] ): Task[] => {
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
			<QueryMembershipProducts siteId={ site?.ID ?? 0 } />
			<Launchpad siteSlug={ site?.slug ?? null } checklistSlug="earn" taskFilter={ taskFilter } />
		</div>
	);
};

export default EarnLaunchpad;
