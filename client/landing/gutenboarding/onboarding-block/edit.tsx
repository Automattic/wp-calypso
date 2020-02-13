/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import DesignSelector from './design-selector';
import StepperWizard from './stepper-wizard';
import VerticalSelect from './vertical-select';
import SignupForm from './signup-form';
import SiteTitle from './site-title';
import CreateSite from './create-site';
import { Attributes } from './types';
import { Step } from '../steps';
import './style.scss';
import VerticalBackground from './vertical-background';
import Link from '../components/link';

const OnboardingEdit: FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { siteVertical, siteTitle, selectedDesign } = useSelect( select =>
		select( STORE_KEY ).getState()
	);
	const isCreatingSite = useSelect( select => select( SITE_STORE ).isFetchingSite() );

	return (
		<>
			<VerticalBackground />
			{ isCreatingSite && <Redirect push to={ Step.CreateSite } /> }
			<Switch>
				<Route exact path={ Step.IntentGathering }>
					<div className="onboarding-block__acquire-intent">
						<div className="onboarding-block__questions">
							<h2 className="onboarding-block__questions-heading">
								{ ! siteVertical &&
									! siteTitle &&
									NO__( "Let's set up your website – it takes only a moment." ) }
							</h2>
							<StepperWizard
								stepComponents={ [ VerticalSelect, ( siteVertical || siteTitle ) && SiteTitle ] }
							/>
							{ siteVertical && (
								<div className="onboarding-block__footer">
									<Link
										to={ Step.DesignSelection }
										className="onboarding-block__question-skip"
										isLink
									>
										{ /* @TODO: add transitions and correct action */ }
										{ siteTitle ? NO__( 'Continue' ) : NO__( "Don't know yet" ) } →
									</Link>
								</div>
							) }
						</div>
					</div>
				</Route>
				<Route exact path={ Step.DesignSelection }>
					{ ! siteVertical ? <Redirect to={ Step.IntentGathering } /> : <DesignSelector /> }
				</Route>
				<Route exact path={ Step.PageSelection }>
					{ ! selectedDesign ? (
						<Redirect to={ Step.DesignSelection } />
					) : (
						<DesignSelector showPageSelector={ true } />
					) }
				</Route>
				<Route exact path={ Step.Signup }>
					<SignupForm />
				</Route>
				<Route exact path={ Step.CreateSite }>
					{ ! isCreatingSite ? <Redirect to={ Step.IntentGathering } /> : <CreateSite /> }
				</Route>
			</Switch>
		</>
	);
};

export default OnboardingEdit;
