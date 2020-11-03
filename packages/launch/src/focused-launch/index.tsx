/**
 * External dependencies
 */
import React from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { FocusedLaunchRoute } from './routes';
import FocusedLaunchOverview from './summary';
import FocusedLaunchDomainDetails from './domain-details';
import FocusedLaunchPlanDetails from './plan-details';

import './style.scss';

interface Props {
	siteId: number;
}

const FocusedLaunch: React.FunctionComponent< Props > = ( { siteId } ) => {
	return (
		<Router initialEntries={ [ FocusedLaunchRoute.Summary ] }>
			<div>Common FL content</div>
			<Switch>
				<Route path={ FocusedLaunchRoute.DomainDetails }>
					<FocusedLaunchDomainDetails />
				</Route>
				<Route path={ FocusedLaunchRoute.PlanDetails }>
					<FocusedLaunchPlanDetails />
				</Route>
				<Route path={ FocusedLaunchRoute.Summary }>
					<FocusedLaunchOverview siteId={ siteId } />
				</Route>
			</Switch>
		</Router>
	);
};

export default FocusedLaunch;
