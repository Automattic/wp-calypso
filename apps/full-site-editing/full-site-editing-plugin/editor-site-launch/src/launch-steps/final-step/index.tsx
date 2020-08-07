/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
/**
 * Internal dependencies
 */
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';

import './styles.scss';

const FinalStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep } ) => {
	const handleClick = () => {
		onNextStep?.();
	};

	return (
		<LaunchStepContainer className="nux-launch-final-step">
			<div className="nux-final-preview-hint">
				<div>
					This is just a demo of how to reveal the site content behind to let user preview one more
					time before submitting.
				</div>
				<Button isPrimary onClick={ handleClick }>
					Confirm &amp; Launch
				</Button>
			</div>
		</LaunchStepContainer>
	);
};

export default FinalStep;
