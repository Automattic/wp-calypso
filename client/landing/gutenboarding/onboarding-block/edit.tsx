/**
 * External dependencies
 */
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import { Redirect, Route } from 'react-router-dom';

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
import { CSSTransition } from 'react-transition-group';

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
			<Route exact path={ makePath( Step.IntentGathering ) }>
				{ ( { match } ) => (
					<CSSTransition
						in={ match !== null }
						unmountOnExit
						classNames="gutenboarding-page"
						timeout={ 500 }
					>
						<AcquireIntent />
					</CSSTransition>
				) }
			</Route>

			{ ! siteVertical && (
				<Route path={ makePath( Step.DesignSelection ) }>
					<Redirect to={ makePath( Step.IntentGathering ) } />
				</Route>
			) }

			<Route path={ makePath( Step.DesignSelection ) }>
				{ ( { match } ) => (
					<CSSTransition
						in={ match !== null }
						unmountOnExit
						classNames="gutenboarding-page"
						timeout={ 500 }
					>
						<DesignSelector />
					</CSSTransition>
				) }
			</Route>

			{ ! selectedDesign && ! isEnabled( 'gutenboarding/style-preview' ) && (
				<Route path={ makePath( Step.Style ) }>
					<Redirect to={ makePath( Step.DesignSelection ) } />
				</Route>
			) }

			<Route path={ makePath( Step.Style ) }>
				{ ( { match } ) => (
					<CSSTransition
						in={ match !== null }
						unmountOnExit
						classNames="gutenboarding-page"
						timeout={ 500 }
					>
						<StylePreview />
					</CSSTransition>
				) }
			</Route>

			<Route path={ makePath( Step.CreateSite ) }>
				{ ( { match } ) => (
					<CSSTransition
						in={ match !== null }
						unmountOnExit
						classNames="gutenboarding-page"
						timeout={ 500 }
					>
						<CreateSite />
					</CSSTransition>
				) }
			</Route>
		</div>
	);
};

export default OnboardingEdit;
