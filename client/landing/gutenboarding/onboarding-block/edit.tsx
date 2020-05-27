/**
 * External dependencies
 */
import { BlockEditProps } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { FunctionComponent, useEffect, useCallback } from 'react';
import { Redirect, Switch, Route, useLocation } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import { USER_STORE } from '../stores/user';
import DesignSelector from './design-selector';
import CreateSite from './create-site';
import { Attributes } from './types';
import { Step, usePath, useNewQueryParam } from '../path';
import AcquireIntent from './acquire-intent';
import StylePreview from './style-preview';
import Plans from './plans';
import { isEnabled } from '../../../config';
import { useFreeDomainSuggestion } from '../hooks/use-free-domain-suggestion';

import './colors.scss';
import './style.scss';

const OnboardingEdit: FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { selectedDesign, selectedFonts } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
	const { createSite } = useDispatch( STORE_KEY );
	const isRedirecting = useSelect( ( select ) => select( STORE_KEY ).getIsRedirecting() );
	const isCreatingSite = useSelect( ( select ) => select( SITE_STORE ).isFetchingSite() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const shouldTriggerCreate = useNewQueryParam();
	const freeDomainSuggestion = useFreeDomainSuggestion();

	const makePath = usePath();

	const { pathname } = useLocation();

	React.useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ pathname ] );

	const canUseStyleStep = useCallback( (): boolean => {
		return !! selectedDesign;
	}, [ selectedDesign ] );

	const canUseCreateSiteStep = useCallback( (): boolean => {
		return isCreatingSite || isRedirecting;
	}, [ isCreatingSite, isRedirecting ] );

	const canUsePlansStep = useCallback( (): boolean => {
		return !! selectedDesign && !! selectedFonts && isEnabled( 'gutenboarding/plans-grid' );
	}, [ selectedDesign, selectedFonts ] );

	const getLatestStepPath = (): string => {
		if ( canUsePlansStep() ) {
			return makePath( Step.Plans );
		}

		if ( canUseStyleStep() ) {
			return makePath( Step.Style );
		}

		return makePath( Step.DesignSelection );
	};

	useEffect( () => {
		if (
			! isCreatingSite &&
			! newSite &&
			currentUser &&
			shouldTriggerCreate &&
			canUseStyleStep()
		) {
			createSite( currentUser.username, freeDomainSuggestion );
		}
	}, [
		canUseStyleStep,
		createSite,
		currentUser,
		freeDomainSuggestion,
		isCreatingSite,
		newSite,
		shouldTriggerCreate,
	] );

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
					{ canUseStyleStep() ? (
						<StylePreview />
					) : (
						<Redirect to={ makePath( Step.DesignSelection ) } />
					) }
				</Route>

				<Route path={ makePath( Step.Plans ) }>
					{ canUsePlansStep() ? <Plans /> : <Redirect to={ makePath( Step.Style ) } /> }
				</Route>

				<Route path={ makePath( Step.CreateSite ) }>
					{ canUseCreateSiteStep() ? <CreateSite /> : <Redirect to={ getLatestStepPath() } /> }
				</Route>
			</Switch>
		</div>
	);
};

export default OnboardingEdit;
