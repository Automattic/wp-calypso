/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent, useState } from 'react';
import classNames from 'classnames';
import { Switch, Route, Redirect } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import DesignSelector from './design-selector';
import StepperWizard from './stepper-wizard';
import VerticalSelect from './vertical-select';
import SiteTitle from './site-title';
import { Attributes } from './types';
import { Step } from '../steps';
import './style.scss';
import VerticalBackground from './vertical-background';
import Link from '../components/link';

const OnboardingEdit: FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { siteVertical, siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const [ hasBackground, setHasBackground ] = useState( false );

	return (
		<>
			<VerticalBackground onLoad={ () => setHasBackground( true ) } />
			<Switch>
				<Route exact path={ Step.IntentGathering }>
					<div
						className={ classNames( 'onboarding-block__acquire-intent', {
							'has-background': hasBackground && siteVertical,
						} ) }
					>
						<div className="onboarding-block__questions">
							<h2 className="onboarding-block__questions-heading">
								{ ! siteVertical &&
									! siteTitle &&
									NO__( "Let's set up your website – it takes only a moment." ) }
								{ /* This empty 'non breaking space' is here so that the content below doesn't jump around once the 'siteTitle' is added */ }
								&nbsp;
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
			</Switch>
		</>
	);
};

export default OnboardingEdit;
