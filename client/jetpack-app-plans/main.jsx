import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { getPlanSlug } from 'calypso/state/plans/selectors';

import './style.scss';

const JetpackAppPlans = ( { domainName, redirectTo } ) => {
	const planSlug = useSelector( ( state ) =>
		getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 )
	);
	const plansLoaded = Boolean( planSlug );

	// Helper function to handle redirection
	const handleRedirect = ( data ) => {
		if ( redirectTo ) {
			window.location.href = `${ redirectTo }${
				data ? `?cartItem=${ encodeURIComponent( JSON.stringify( data ) ) }` : ''
			}`;
		}
	};

	const onUpgradeClick = ( partialPlan ) => {
		if ( partialPlan ) {
			const plan = getPlan( partialPlan.product_slug );
			const cartItem = {
				product_id: plan.getProductId(),
				product_slug: partialPlan.product_slug,
			};
			handleRedirect( cartItem );
		} else {
			handleRedirect();
		}
	};

	const removePaidDomain = () => handleRedirect();

	return (
		<Main className="jetpack-app-plans">
			<QueryPlans />
			{ plansLoaded ? (
				<PlansFeaturesMain
					paidDomainName={ domainName }
					intent="plans-jetpack-app-site-creation"
					isInSignup
					intervalType="yearly"
					onUpgradeClick={ onUpgradeClick }
					plansWithScroll={ false }
					flowName="onboarding"
					removePaidDomain={ removePaidDomain }
					hidePlanTypeSelector
				/>
			) : (
				<div className="plans__loading">
					<LoadingEllipsis active />
				</div>
			) }
		</Main>
	);
};

export default JetpackAppPlans;
