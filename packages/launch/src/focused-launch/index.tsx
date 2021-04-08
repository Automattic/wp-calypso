/**
 * External dependencies
 */
import * as React from 'react';
import { MemoryRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelect } from '@wordpress/data';
import { ScrollToTop } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import { useSite } from '../hooks';
import { Route as FocusedLaunchRoute } from './route';
import Summary from './summary';
import DomainDetails from './domain-details';
import PlanDetails from './plan-details';
import Success from './success';
import { LAUNCH_STORE } from '../stores';
import { useDomainSuggestionFromCart, usePlanProductIdFromCart } from '../hooks';

import './style.scss';

const FocusedLaunch: React.FunctionComponent = () => {
	const { hasPaidPlan, isSiteLaunched, isSiteLaunching } = useSite();

	const [ hasSelectedDomain, selectedPlanProductId ] = useSelect( ( select ) => {
		const { planProductId } = select( LAUNCH_STORE ).getState();

		return [ select( LAUNCH_STORE ).hasSelectedDomainOrSubdomain(), planProductId ];
	} );

	// @TODO: extract to some hook for reusability (Eg: use-products-from-cart)
	// If there is no selected domain, but there is a domain in cart,
	// set the domain from cart as the selected domain.
	const domainSuggestionFromCart = useDomainSuggestionFromCart();
	const { setDomain } = useDispatch( LAUNCH_STORE );
	React.useEffect( () => {
		if ( ! hasSelectedDomain && domainSuggestionFromCart ) {
			setDomain( domainSuggestionFromCart );
		}
	}, [ hasSelectedDomain, domainSuggestionFromCart, setDomain ] );

	// @TODO: extract to some hook for reusability (Eg: use-products-from-cart)
	// If there is no selected plan and the site has no paid plan, but there is a plan in cart,
	// set the plan from cart as the selected plan.
	const planProductIdFromCart = usePlanProductIdFromCart();
	const { setPlanProductId } = useDispatch( LAUNCH_STORE );

	// Once there is a selected plan, do not retrieve plan from from cart anymore.
	const canUsePlanProductIdFromCart = React.useRef( true );
	React.useEffect( () => {
		if ( selectedPlanProductId ) {
			canUsePlanProductIdFromCart.current = false;
		}
	}, [ selectedPlanProductId ] );

	React.useEffect( () => {
		if (
			! selectedPlanProductId &&
			planProductIdFromCart &&
			! hasPaidPlan &&
			canUsePlanProductIdFromCart.current
		) {
			setPlanProductId( planProductIdFromCart );
		}
	}, [
		selectedPlanProductId,
		planProductIdFromCart,
		setPlanProductId,
		hasPaidPlan,
		canUsePlanProductIdFromCart,
	] );

	// The user may have previously used the launch flow to pick a paid plan,
	// but they may have then purchased that paid plan or other plan before deciding to continue Launch flow.
	// In this scenario, the site has a paid plan but it is not launched yet.
	// So when launch modal reopens, we need to unset the selected plan product
	// id (that was previously selected, but is not needed anymore).
	// This is one of the cases mentioned in
	// https://github.com/Automattic/wp-calypso/issues/49958
	const { unsetPlanProductId } = useDispatch( LAUNCH_STORE );
	React.useEffect( () => {
		if ( hasPaidPlan ) {
			unsetPlanProductId();
		}
	}, [ hasPaidPlan, unsetPlanProductId ] );

	return (
		<Router>
			<ScrollToTop selector=".components-modal__content" />
			{ ( isSiteLaunched || isSiteLaunching ) && <Redirect to={ FocusedLaunchRoute.Success } /> }
			<Switch>
				<Route path={ FocusedLaunchRoute.DomainDetails }>
					<DomainDetails />
				</Route>
				<Route path={ FocusedLaunchRoute.PlanDetails }>
					<PlanDetails />
				</Route>
				<Route path={ FocusedLaunchRoute.Success }>
					<Success />
				</Route>
				{ /* Summary route matches every path that is not matched by routes above */ }
				<Route path={ FocusedLaunchRoute.Summary }>
					<Summary />
				</Route>
			</Switch>
		</Router>
	);
};

export default FocusedLaunch;
