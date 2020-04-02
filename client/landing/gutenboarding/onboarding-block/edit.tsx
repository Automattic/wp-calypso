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
import CreateSite from './create-site';
import { Attributes } from './types';
import { Step, usePath, useNewQueryParam } from '../path';
import AcquireIntent from './acquire-intent';
import StylePreview from './style-preview';
import { isEnabled } from '../../../config';

import './colors.scss';
import './style.scss';

const OnboardingEdit: FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { siteVertical, selectedDesign } = useSelect( select => select( STORE_KEY ).getState() );
	const isCreatingSite = useSelect( select => select( SITE_STORE ).isFetchingSite() );
	const replaceHistory = useNewQueryParam();

	const makePath = usePath();

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
					{ ! siteVertical ? (
						<Redirect to={ makePath( Step.IntentGathering ) } />
					) : (
						<DesignSelector />
					) }
				</Route>

				<Route path={ makePath( Step.Style ) }>
					{ // Disable reason: Leave me alone, my nested ternaries are amazing ✨
					// eslint-disable-next-line no-nested-ternary
					! selectedDesign ? (
						<Redirect to={ makePath( Step.DesignSelection ) } />
					) : isEnabled( 'gutenboarding/style-preview' ) ? (
						<StylePreview />
					) : (
						<Redirect to={ makePath( Step.DesignSelection ) } />
					) }
				</Route>

				<Route path={ makePath( Step.CreateSite ) }>
					<CreateSite />
				</Route>
			</Switch>
		</div>
	);
};

export default OnboardingEdit;
