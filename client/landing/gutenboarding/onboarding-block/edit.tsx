/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { BlockEditProps } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent, useState } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import DesignSelector from './design-selector';
import StepperWizard from './stepper-wizard';
import VerticalSelect from './vertical-select';
import SiteTitle from './site-title';
import { Attributes } from './types';
import { Step } from '../types';
import './style.scss';
import VerticalBackground from './vertical-background';
import Link from '../components/link';

const OnboardingEdit: FunctionComponent< BlockEditProps< Attributes > > = ( {
	attributes: { step = 0 },
} ) => {
	const { siteVertical, siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const [ hasBackground, setHasBackground ] = useState( false );

	switch ( step ) {
		case Step.IntentGathering:
			return (
				<div
					className={ classNames( 'onboarding-block__acquire-intent', {
						'has-background': hasBackground && siteVertical,
					} ) }
				>
					{ ( hasBackground || siteVertical ) && (
						<VerticalBackground id={ siteVertical?.id } onLoad={ () => setHasBackground( true ) } />
					) }
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
								<Link to="/design" className="onboarding-block__question-skip" isLink>
									{ /* @TODO: add transitions and correct action */ }
									{ siteTitle ? NO__( 'Continue' ) : NO__( "Don't know yet" ) } →
								</Link>
							</div>
						) }
					</div>
				</div>
			);
		case Step.DesignSelection:
			return <DesignSelector />;
	}

	return null;
};

export default OnboardingEdit;
