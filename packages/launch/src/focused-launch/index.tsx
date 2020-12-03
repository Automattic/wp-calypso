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

import './style.scss';

const FocusedLaunch: React.FunctionComponent = () => {
	const shouldDisplaySuccessView = useSelect( ( select ) =>
		select( LAUNCH_STORE ).shouldDisplaySuccessView()
	);

	const { isSiteLaunched, isSiteLaunching } = useSite();

	const { enablePersistentSuccessView } = useDispatch( LAUNCH_STORE );

	React.useEffect( () => {
		if ( isSiteLaunched ) {
			enablePersistentSuccessView();
		}
		if ( isSiteLaunched || isSiteLaunching ) {
			document.body.classList.add( 'is-focused-launch-complete' );
		}
	}, [ isSiteLaunched, isSiteLaunching, enablePersistentSuccessView ] );

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
