/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import LaunchStep, { Props as LaunchStepProps } from '../../launch-step';
import './styles.scss';

const DomainStep: React.FunctionComponent< LaunchStepProps > = ( { onPrevStep, onNextStep } ) => {
	const handleBack = () => {
		onPrevStep && onPrevStep();
	};

	const handleContinue = () => {
		onNextStep && onNextStep();
	};

	return (
		<LaunchStep className="domain-step">
			<div className="launch-step__header">
				<div className="launch-step__heading">
					<h1 className="launch-step__title">{ __( 'Choose a domain', 'full-site-editing' ) }</h1>
					<p className="launch-step__subtitle">
						{ __( 'Free for the first year with any paid plan', 'full-site-editing' ) }
					</p>
				</div>
				<div className="launch-step__actions">
					<Button isTertiary onClick={ handleBack }>
						{ __( 'Go back', 'full-site-editing' ) }
					</Button>
					<Button isPrimary onClick={ handleContinue }>
						{ __( 'Continue', 'full-site-editing' ) }
					</Button>
				</div>
			</div>
			<div className="launch-step__body"></div>
		</LaunchStep>
	);
};

export default DomainStep;
