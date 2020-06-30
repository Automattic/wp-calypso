/**
 * External dependencies
 */
import type { BlockEditProps } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { FunctionComponent, useEffect, useCallback } from 'react';
import { Redirect, Switch, Route, useLocation } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import { USER_STORE } from '../stores/user';
import { useShouldSiteBePublicOnSelectedPlan } from '../hooks/use-selected-plan';
import DesignSelector from './design-selector';
import CreateSite from './create-site';
import CreateSiteError from './create-site-error';
import type { Attributes } from './types';
import { Step, usePath, useNewQueryParam } from '../path';
import AcquireIntent from './acquire-intent';
import StylePreview from './style-preview';
import Plans from './plans';
import Domains from './domains';

import './colors.scss';
import './style.scss';

const OnboardingEdit: FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { selectedDesign, siteTitle } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const { createSite } = useDispatch( STORE_KEY );
	const isRedirecting = useSelect( ( select ) => select( STORE_KEY ).getIsRedirecting() );
	const isCreatingSite = useSelect( ( select ) => select( SITE_STORE ).isFetchingSite() );
	const newSiteError = useSelect( ( select ) => select( SITE_STORE ).getNewSiteError() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const shouldTriggerCreate = useNewQueryParam();

	const makePath = usePath();

	const { pathname } = useLocation();

	React.useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ pathname ] );

	const canUseDesignStep = useCallback( (): boolean => {
		return !! siteTitle;
	}, [ siteTitle ] );

	const canUseStyleStep = useCallback( (): boolean => {
		return !! selectedDesign;
	}, [ selectedDesign ] );

	const canUseCreateSiteStep = useCallback( (): boolean => {
		return isCreatingSite || isRedirecting;
	}, [ isCreatingSite, isRedirecting ] );

	const getLatestStepPath = (): string => {
		if ( canUseStyleStep() ) {
			return makePath( Step.Plans );
		}

		if ( canUseDesignStep() ) {
			return makePath( Step.DesignSelection );
		}

		return makePath( Step.IntentGathering );
	};

	const shouldSiteBePublic = useShouldSiteBePublicOnSelectedPlan();

	useEffect( () => {
		if (
			! isCreatingSite &&
			! newSite &&
			currentUser &&
			shouldTriggerCreate &&
			canUseStyleStep()
		) {
			createSite( currentUser.username, undefined, shouldSiteBePublic );
		}
	}, [
		createSite,
		currentUser,
		isCreatingSite,
		newSite,
		shouldTriggerCreate,
		canUseStyleStep,
		shouldSiteBePublic,
	] );

	const redirectToLatestStep = <Redirect to={ getLatestStepPath() } />;

	function createSiteOrError() {
		if ( newSiteError ) {
			return <CreateSiteError linkTo={ getLatestStepPath() } />;
		} else if ( canUseCreateSiteStep() ) {
			return <CreateSite />;
		}

		return redirectToLatestStep;
	}

	return (
		<div className="onboarding-block">
			{ isCreatingSite && (
				<Redirect
					push={ shouldTriggerCreate ? undefined : true }
					to={ makePath( Step.CreateSite ) }
				/>
			) }
			<Switch>
				<Route exact path={ makePath( Step.IntentGathering ) }>
					<AcquireIntent />
				</Route>

				<Route path={ makePath( Step.DesignSelection ) }>
					<DesignSelector />
				</Route>

				<Route path={ makePath( Step.Style ) }>
					{ canUseStyleStep() ? <StylePreview /> : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.Domains ) }>
					<Domains />
				</Route>

				<Route path={ makePath( Step.DomainsModal ) }>
					<Domains isModal />
				</Route>

				<Route path={ makePath( Step.Plans ) }>
					{ canUseStyleStep() ? <Plans /> : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.PlansModal ) }>
					<Plans isModal />
				</Route>

				<Route path={ makePath( Step.CreateSite ) }>{ createSiteOrError() }</Route>
			</Switch>
		</div>
	);
};

export default OnboardingEdit;
