/**
 * External dependencies
 */
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import { Redirect, Switch, Route, useLocation } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import DesignSelector from './design-selector';
import CreateSite from './create-site';
import { Attributes } from './types';
import { Step, usePath, useNewQueryParam } from '../path';
import AcquireIntent from './acquire-intent';
import StylePreview from './style-preview';
import { isEnabled } from '../../../config';

import './colors.scss';
import './style.scss';

const OnboardingEdit: FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { siteTitle, siteVertical, selectedDesign, wasVerticalSkipped } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
	const isRedirecting = useSelect( ( select ) => select( STORE_KEY ).getIsRedirecting() );
	const isCreatingSite = useSelect( ( select ) => select( SITE_STORE ).isFetchingSite() );
	const replaceHistory = useNewQueryParam();

	const makePath = usePath();

	const { pathname } = useLocation();

	React.useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ pathname ] );

	const canUseDesignSelection = (): boolean => {
		return ! ( ! siteVertical && ! siteTitle && ! wasVerticalSkipped );
	};

	const canUseStyleStep = (): boolean => {
		return !! selectedDesign && isEnabled( 'gutenboarding/style-preview' );
	};

	const canUseCreateSiteStep = (): boolean => {
		return isCreatingSite || isRedirecting;
	};

	const getLatestStepPath = (): string => {
		if ( ! canUseDesignSelection() ) {
			return makePath( Step.IntentGathering );
		}
		if ( ! canUseStyleStep ) {
			return makePath( Step.DesignSelection );
		}
		return makePath( Step.IntentGathering );
	};

	return (
		<div className="onboarding-block" data-vertical={ siteVertical?.label }>
			{ isCreatingSite && (
				<Redirect push={ replaceHistory ? undefined : true } to={ makePath( Step.CreateSite ) } />
			) }
			<Switch>
				<Route exact path={ makePath( Step.IntentGathering ) }>
					<AcquireIntent />
				</Route>

				<Route path={ makePath( Step.DesignSelection ) }>
					{ canUseDesignSelection() ? (
						<DesignSelector />
					) : (
						<Redirect to={ makePath( Step.IntentGathering ) } />
					) }
				</Route>

				<Route path={ makePath( Step.Style ) }>
					{ canUseStyleStep() ? (
						<StylePreview />
					) : (
						<Redirect to={ makePath( Step.DesignSelection ) } />
					) }
				</Route>

				<Route path={ makePath( Step.CreateSite ) }>
					{ canUseCreateSiteStep() ? <CreateSite /> : <Redirect to={ getLatestStepPath() } /> }
				</Route>
			</Switch>
		</div>
	);
};

export default OnboardingEdit;
