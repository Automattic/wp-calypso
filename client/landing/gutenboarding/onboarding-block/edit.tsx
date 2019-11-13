/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { isFilledFormValue } from '../store/types';
import { STORE_KEY } from '../store';
import Question from './question';
import VerticalSelect from './vertical-select';
import SiteTypeSelect, { siteTypeOptions } from './site-type-select';
import SiteTitle from './site-title';
import './style.scss';

export default function OnboardingEdit() {
	const [ activeStep, setActiveStep ] = useState( 0 );

	const { siteType, siteVertical, siteTitle } = useSelect( select =>
		select( STORE_KEY ).getState()
	);

	const handleNext = () => setActiveStep( activeStep + 1 );

	const steps = [
		{
			value: siteType,
			label: isFilledFormValue( siteType )
				? NO__( 'I want to create a website ' )
				: NO__( 'Setting up a website ' ),
			displayValue: isFilledFormValue( siteType ) ? siteTypeOptions[ siteType ] : '',
			StepInput: SiteTypeSelect,
		},
		{
			value: siteVertical,
			label: NO__( 'My site is about' ),
			displayValue: isFilledFormValue( siteVertical )
				? siteVertical.label
				: NO__( 'enter a topic' ),
			StepInput: VerticalSelect,
		},
		{
			value: siteTitle,
			label: NO__( "It's called" ),
			displayValue: siteTitle.length ? siteTitle : NO__( 'enter a title' ),
			StepInput: SiteTitle,
		},
	];

	return (
		<div className="onboarding-block__acquire-intent">
			<div className="onboarding-block__questions">
				<h2 className="onboarding-block__questions-heading">
					{ ! isFilledFormValue( siteType ) &&
						NO__( "Let's set up your website – it takes only a moment." ) }
				</h2>
				{ steps.map(
					( step, index ) =>
						( index < 1 || isFilledFormValue( steps[ index - 1 ].value ) ) && (
							<Question
								key={ index }
								isActive={ index === activeStep }
								onExpand={ () => setActiveStep( index ) }
								onSelect={ handleNext }
								{ ...step }
							/>
						)
				) }
				{ isFilledFormValue( siteVertical ) && (
					<div className="onboarding-block__footer">
						<Button className="onboarding-block__question-skip" isLink>
							{ NO__( "Don't know yet" ) } →
						</Button>
					</div>
				) }
			</div>
		</div>
	);
}
