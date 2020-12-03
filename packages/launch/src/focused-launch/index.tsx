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

	React.useEffect( () => {
		if ( isSiteLaunched || isSiteLaunching ) {
			document.body.classList.add( 'is-focused-launch-complete' );
		}
	}, [ isSiteLaunched, isSiteLaunching ] );

	// If there is no selected domain, but there is a domain in cart,
	// set the domain from cart as the selected domain.
	const domainSuggestionFromCart = useDomainSuggestionFromCart();
	const selectedDomain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const { setDomain } = useDispatch( LAUNCH_STORE );
	React.useEffect( () => {
		if ( ! selectedDomain && domainSuggestionFromCart ) {
			setDomain( domainSuggestionFromCart );
		}
	}, [ selectedDomain, domainSuggestionFromCart, setDomain ] );

	// If there is no selected plan, but there is a plan in cart,
	// set the plan from cart as the selected plan.
	const planFromCart = usePlanFromCart();
	const selectedPlan = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedPlan() );
	const { setPlan } = useDispatch( LAUNCH_STORE );
	React.useEffect( () => {
		if ( ! selectedPlan && planFromCart ) {
			setPlan( planFromCart );
		}
	}, [ selectedPlan, planFromCart, setPlan ] );

	return (
		<Router initialEntries={ [ FocusedLaunchRoute.Summary ] }>
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
