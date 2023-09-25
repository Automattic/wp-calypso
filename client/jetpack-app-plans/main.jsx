import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Main from 'calypso/components/main';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { getPlanSlug } from 'calypso/state/plans/selectors';

import './style.scss';

const JetpackAppPlans = ( { domainName } ) => {
	const planSlug = useSelector( ( state ) =>
		getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 )
	);
	const plansLoaded = Boolean( planSlug );

	const loading = (
		<div className="plans__loading">
			<LoadingEllipsis active />
		</div>
	);

	const onUpgradeClick = () => {
		// TODO: Implement this
		// console.log(cartItem);
	};

	const removePaidDomain = () => {
		// TODO: Continue with free plan flow
	};

	const plans = (
		<PlansFeaturesMain
			paidDomainName={ domainName }
			isInSignup={ true }
			intervalType="yearly"
			onUpgradeClick={ ( cartItem ) => onUpgradeClick( cartItem ) }
			customerType="personal"
			plansWithScroll={ false }
			flowName="onboarding"
			removePaidDomain={ () => removePaidDomain() }
		/>
	);

	return (
		<Main className="jetpack-app-plans">
			<QueryPlans />
			{ plansLoaded ? plans : loading }
		</Main>
	);
};

export default JetpackAppPlans;
