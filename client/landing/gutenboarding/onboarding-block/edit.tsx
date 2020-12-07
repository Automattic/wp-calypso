/**
 * External dependencies
 */
import * as React from 'react';
import { Redirect, Switch, Route, useLocation } from 'react-router-dom';
import type { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import DesignSelector from './design-selector';
import CreateSite from './create-site';
import CreateSiteError from './create-site-error';
import type { Attributes } from './types';
import { Step, usePath, useNewQueryParam } from '../path';
import AcquireIntent from './acquire-intent';
import Import from './import';
import StylePreview from './style-preview';
import Features from './features';
import Plans from './plans';
import Domains from './domains';
import Language from './language';

import './colors.scss';
import './style.scss';

const OnboardingEdit: React.FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { selectedDesign, siteTitle, isImporting } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
	const isRedirecting = useSelect( ( select ) => select( STORE_KEY ).getIsRedirecting() );
	const isCreatingSite = useSelect( ( select ) => select( SITE_STORE ).isFetchingSite() );
	const newSiteError = useSelect( ( select ) => select( SITE_STORE ).getNewSiteError() );
	const shouldTriggerCreate = useNewQueryParam();

	const makePath = usePath();

	const { pathname } = useLocation();

	React.useEffect( () => {
		setTimeout( () => window.scrollTo( 0, 0 ), 0 );
	}, [ pathname ] );

	const canUseDesignStep = React.useCallback( (): boolean => {
		return !! siteTitle;
	}, [ siteTitle ] );

	const canUseStyleStep = React.useCallback( (): boolean => {
		return !! selectedDesign;
	}, [ selectedDesign ] );

	const canUseCreateSiteStep = React.useCallback( (): boolean => {
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
			{ isImporting && (
				<Redirect push={ shouldTriggerCreate ? undefined : true } to={ makePath( Step.Import ) } />
			) }
			<Switch>
				<Route exact path={ makePath( Step.IntentGathering ) }>
					<AcquireIntent />
				</Route>

				<Route exact path={ makePath( Step.Import ) }>
					<AcquireIntent />
					<Import />
				</Route>

				<Route path={ makePath( Step.DesignSelection ) }>
					<DesignSelector />
				</Route>

				<Route path={ makePath( Step.Style ) }>
					{ canUseStyleStep() ? <StylePreview /> : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.Features ) }>
					{ canUseStyleStep() ? <Features /> : redirectToLatestStep }
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

				<Route path={ makePath( Step.LanguageModal ) }>
					<Language />
				</Route>

				<Route path={ makePath( Step.CreateSite ) }>{ createSiteOrError() }</Route>
			</Switch>
		</div>
	);
};

export default OnboardingEdit;
