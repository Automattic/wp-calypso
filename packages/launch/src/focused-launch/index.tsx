/**
 * External dependencies
 */
import React from 'react';
import { MemoryRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { useSite } from '../hooks';
import { Route as FocusedLaunchRoute } from './route';
import Summary from './summary';
import DomainDetails from './domain-details';
import PlanDetails from './plan-details';
import Success from './success';

import './style.scss';

const FocusedLaunch: React.FunctionComponent = () => {
	const { isLaunched, isSiteLaunching } = useSite();

	React.useEffect( () => {
		if ( isLaunched || isSiteLaunching ) {
			document.body.classList.add( 'is-focused-launch-complete' );
		}
	}, [ isLaunched, isSiteLaunching ] );

	return (
		<Router initialEntries={ [ FocusedLaunchRoute.Summary ] }>
			{ ( isLaunched || isSiteLaunching ) && <Redirect to={ FocusedLaunchRoute.Success } /> }
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
