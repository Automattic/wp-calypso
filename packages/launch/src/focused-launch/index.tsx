/**
 * External dependencies
 */
import * as React from 'react';
import { MemoryRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelect } from '@wordpress/data';

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
import { useDomainSuggestionFromCart, usePlanFromCart } from '../hooks';

import './style.scss';

const FocusedLaunch: React.FunctionComponent = () => {
	const { isSiteLaunched, isSiteLaunching } = useSite();

	const { enablePersistentSuccessView } = useDispatch( LAUNCH_STORE );

	const [ hasSelectedDomain, selectedPlan, shouldDisplaySuccessView ] = useSelect( ( select ) => {
		const { plan, shouldDisplaySuccessView } = select( LAUNCH_STORE ).getState();

		return [ select( LAUNCH_STORE ).hasSelectedDomain(), plan, shouldDisplaySuccessView ];
	} );

	// Force Success view to be the default view when opening Focused Launch modal.
	// This is used in case the user opens the Focused Launch modal after launching
	// the site (e.g. when redirected back after the checkout screen)
	React.useEffect( () => {
		if ( isSiteLaunched ) {
			enablePersistentSuccessView();
		}
	}, [ isSiteLaunched, enablePersistentSuccessView ] );

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
	// If there is no selected plan, but there is a plan in cart,
	// set the plan from cart as the selected plan.
	const planFromCart = usePlanFromCart();
	const { setPlan } = useDispatch( LAUNCH_STORE );
	React.useEffect( () => {
		if ( ! selectedPlan && planFromCart ) {
			setPlan( planFromCart );
		}
	}, [ selectedPlan, planFromCart, setPlan ] );

	return (
		<Router
			initialEntries={ [ FocusedLaunchRoute.Summary, FocusedLaunchRoute.Success ] }
			initialIndex={ shouldDisplaySuccessView ? 1 : 0 }
		>
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
