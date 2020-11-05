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

interface Props {
	siteId: number;
}

const FocusedLaunch: React.FunctionComponent< Props > = ( { siteId } ) => {
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
					<Summary siteId={ siteId } />
				</Route>
			</Switch>
		</Router>
	);
};

export default FocusedLaunch;
