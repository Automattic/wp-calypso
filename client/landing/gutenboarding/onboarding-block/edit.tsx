/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { isEmpty } from 'lodash';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
/**
 * Internal dependencies
 */
import { isFilledFormValue } from '../store/types';
import { STORE_KEY } from '../store';
import VerticalSelect from './vertical-select';
import SiteTypeSelect, { siteTypeOptions } from './site-type-select';
import './style.scss';

interface StepProps {
	isActive: boolean;
	onExpand: () => void;
	onSelect: () => void;
}

const Step1 = ( { isActive, onExpand, onSelect }: StepProps ) => {
	const { siteType } = useSelect( select => select( STORE_KEY ).getState() );

	return (
		<>
			<span>
				{ isEmpty( siteType )
					? NO__( 'I want to create a website ' )
					: NO__( 'Setting up a website ' ) }
			</span>
			{ isActive ? (
				<SiteTypeSelect onSelect={ onSelect } />
			) : (
				<div className="onboarding-block__multi-question">
					<button className="onboarding-block__question-answered" onClick={ onExpand }>
						{ siteTypeOptions[ siteType ] }
					</button>
					<span>.</span>
				</div>
			) }
		</>
	);
};

const Step2 = ( { isActive, onExpand, onSelect }: StepProps ) => {
	const { siteType, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );

	if ( ! isFilledFormValue( siteType ) && isEmpty( siteVertical ) ) {
		return null;
	}

	return (
		<>
			<span>{ NO__( 'My site is about' ) }</span>
			<div className="onboarding-block__multi-question">
				{ isActive ? (
					<VerticalSelect
						inputClass="onboarding-block__question-input"
						onVerticalSelect={ onSelect }
					/>
				) : (
					<>
						<button className="onboarding-block__question-answered" onClick={ onExpand }>
							{ siteVertical.label }
						</button>
						<span>.</span>
					</>
				) }
			</div>
		</>
	);
};

const Step3 = ( { onExpand }: StepProps ) => {
	const { siteTitle, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );

	const updateTitle = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => {
			setSiteTitle( e.target.value );
		},
		[ setSiteTitle ]
	);

	if ( isEmpty( siteVertical ) && ! siteTitle ) {
		return null;
	}
	return (
		<label>
			<span>{ NO__( "It's called" ) }</span>
			<input
				className="onboarding-block__question-input"
				onClick={ onExpand }
				onChange={ updateTitle }
				value={ siteTitle }
			/>
		</label>
	);
};

export default function OnboardingEdit() {
	const [ activeStep, setActiveStep ] = useState( 0 );

	const { siteType, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );

	const handleNext = () => setActiveStep( activeStep + 1 );

	const steps = [ Step1, Step2, Step3 ];

	return (
		<div className="onboarding-block__acquire-intent">
			<div className="onboarding-block__questions">
				<h2 className="onboarding-block__questions-heading">
					{ isEmpty( siteType ) && NO__( "Let's set up your website – it takes only a moment." ) }
				</h2>
				{ steps.map( ( Step, index ) => (
					<div
						key={ index }
						className={ classNames( {
							'onboarding-block__question': true,
							selected: index === activeStep,
						} ) }
					>
						<Step
							isActive={ index === activeStep }
							onExpand={ () => setActiveStep( index ) }
							onSelect={ handleNext }
						/>
					</div>
				) ) }
				{ ! isEmpty( siteVertical ) && (
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
