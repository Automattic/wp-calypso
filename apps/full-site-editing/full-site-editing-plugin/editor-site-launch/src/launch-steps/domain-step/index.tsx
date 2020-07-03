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
import DomainPickerFSE from '../../../../editor-domain-picker/src/domain-picker-fse';
import './styles.scss';

const DomainStep: React.FunctionComponent< LaunchStepProps > = ( { onPrevStep, onNextStep } ) => {
	const handleBack = () => {
		onPrevStep?.();
	};

	const handleContinue = () => {
		onNextStep?.();
	};

	return (
		<LaunchStep className="nux-launch-domain-step">
			<div className="nux-launch-step__header">
				<div className="nux-launch-step__heading">
					<h1 className="nux-launch-step__title">
						{ __( 'Choose a domain', 'full-site-editing' ) }
					</h1>
					<p className="nux-launch-step__subtitle">
						{ __( 'Free for the first year with any paid plan', 'full-site-editing' ) }
					</p>
				</div>
				<div className="nux-launch-step__actions">
					<Button isTertiary onClick={ handleBack }>
						{ __( 'Go back', 'full-site-editing' ) }
					</Button>
					<Button isPrimary onClick={ handleContinue }>
						{ __( 'Continue', 'full-site-editing' ) }
					</Button>
				</div>
			</div>
			<div className="nux-launch-step__body">
				{ /* TODO: When a domain is selected, it should advance to the next step */ }
				<DomainPickerFSE />
			</div>
		</LaunchStep>
	);
};

export default DomainStep;
