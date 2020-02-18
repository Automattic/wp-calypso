/**
 * External dependencies
 */
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import DesignSelector from './design-selector';
import SignupForm from '../components/signup-form';
import CreateSite from './create-site';
import { Attributes } from './types';
import { Step, usePath } from '../path';
import './style.scss';
import VerticalBackground from './vertical-background';
import AcquireIntent from './acquire-intent';

const OnboardingEdit: FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { siteVertical, selectedDesign } = useSelect( select => select( STORE_KEY ).getState() );
	const isCreatingSite = useSelect( select => select( SITE_STORE ).isFetchingSite() );

	const makePath = usePath();

	return (
		<>
			<VerticalBackground />
			{ isCreatingSite && <Redirect push to={ makePath( Step.CreateSite ) } /> }
			<Switch>
				<Route exact path={ makePath( Step.IntentGathering ) }>
					<AcquireIntent />
				</Route>

				<Route path={ makePath( Step.DesignSelection ) }>
					{ ! siteVertical ? (
						<Redirect to={ makePath( Step.IntentGathering ) } />
					) : (
						<DesignSelector />
					) }
				</Route>

				<Route path={ makePath( Step.PageSelection ) }>
					{ ! selectedDesign ? (
						<Redirect to={ makePath( Step.DesignSelection ) } />
					) : (
						<DesignSelector showPageSelector />
					) }
				</Route>

				<Route path={ makePath( Step.Signup ) }>
					<SignupForm />;
				</Route>

				<Route path={ makePath( Step.CreateSite ) }>
					<CreateSite />
				</Route>
			</Switch>
		</>
	);
};

export default OnboardingEdit;
