/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { TextControl, Tip } from '@wordpress/components';
import { Title, SubTitle, ActionButtons, BackButton, NextButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import { useTitle } from '@automattic/launch';
import './styles.scss';

const NameStep: React.FunctionComponent< LaunchStepProps > = ( { onPrevStep, onNextStep } ) => {
	const { title, updateTitle, saveTitle } = useTitle();

	const handleNext = () => {
		saveTitle();
		onNextStep?.();
	};

	const handlePrev = () => {
		onPrevStep?.();
	};

	return (
		<LaunchStepContainer>
			<div className="nux-launch-step__header">
				<div>
					<Title>{ __( 'Name your site', 'full-site-editing' ) }</Title>
					<SubTitle>{ __( 'Pick a name for your site.', 'full-site-editing' ) }</SubTitle>
				</div>
				<ActionButtons sticky={ false }>
					<NextButton onClick={ handleNext } disabled={ ! title?.trim() } />
				</ActionButtons>
			</div>
			<div className="nux-launch-step__body">
				<form onSubmit={ handleNext }>
					<TextControl
						id="nux-launch-step__input"
						className="nux-launch-step__input"
						onChange={ updateTitle }
						onBlur={ saveTitle }
						value={ title }
						spellCheck={ false }
						autoComplete="off"
						placeholder={ __( 'Enter site name', 'full-site-editing' ) }
						autoCorrect="off"
					/>
					<div className="nux-launch-step__input-hint">
						<Tip size={ 18 } />
						{ /* translators: The "it" here refers to the site title. */ }
						<span>{ __( "Don't worry, you can change it later.", 'full-site-editing' ) }</span>
					</div>
				</form>
			</div>
			<div className="nux-launch-step__footer">
				<ActionButtons sticky={ true }>
					<BackButton onClick={ handlePrev } />
					<NextButton onClick={ handleNext } disabled={ ! title?.trim() } />
				</ActionButtons>
			</div>
		</LaunchStepContainer>
	);
};

export default NameStep;
