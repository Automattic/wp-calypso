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
import PlansGridFSE from '../../../../editor-plans-grid/src/plans-grid-fse';
import './styles.scss';

const PlanStep: React.FunctionComponent< LaunchStepProps > = ( { onPrevStep } ) => {
	const handleBack = () => {
		onPrevStep && onPrevStep();
	};

	return (
		<LaunchStep className="nux-launch-plan-step">
			<div className="nux-launch-step__header">
				<div className="nux-launch-step__heading">
					<h1 className="nux-launch-step__title">{ __( 'Choose a plan', 'full-site-editing' ) }</h1>
					<p className="nux-launch-step__subtitle">
						{ __(
							'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.',
							'full-site-editing'
						) }
					</p>
				</div>
				<div className="nux-launch-step__actions">
					<Button isTertiary onClick={ handleBack }>
						{ __( 'Go back', 'full-site-editing' ) }
					</Button>
				</div>
			</div>
			<div className="nux-launch-step__body">
				<PlansGridFSE />
			</div>
		</LaunchStep>
	);
};

export default PlanStep;
