/**
 * External dependencies
 */
import React from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { Route as FocusedLaunchRoute } from './route';
import Summary from './summary';
import DomainDetails from './domain-details';
import PlanDetails from './plan-details';

import './style.scss';

const FocusedLaunch: React.FunctionComponent = () => {
	return (
		<Router initialEntries={ [ FocusedLaunchRoute.Summary ] }>
			<Switch>
				<Route path={ FocusedLaunchRoute.DomainDetails }>
					<DomainDetails />
				</Route>
				<Route path={ FocusedLaunchRoute.PlanDetails }>
					<PlanDetails />
				</Route>
				<Route path={ FocusedLaunchRoute.Summary }>
					<Summary />
				</Route>
			</Switch>
		</Router>
	);
};

export default FocusedLaunch;
