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

const PrivacyStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep } ) => {
	const handleContinue = () => {
		onNextStep && onNextStep();
	};

	return (
		<LaunchStep className="nux-launch-privacy-step">
			<div className="nux-launch-step__header">
				<div className="nux-launch-step__heading">
					<h1 className="nux-launch-step__title">{ __( 'Site privacy', 'full-site-editing' ) }</h1>
					<p className="nux-launch-step__subtitle">
						{ __( 'Control who is able to see your site once your launch', 'full-site-editing' ) }
					</p>
				</div>
				<div className="nux-launch-step__actions">
					<Button isPrimary onClick={ handleContinue }>
						{ __( 'Continue', 'full-site-editing' ) }
					</Button>
				</div>
			</div>
			<div className="nux-launch-step__body"></div>
		</LaunchStep>
	);
};

export default PrivacyStep;
