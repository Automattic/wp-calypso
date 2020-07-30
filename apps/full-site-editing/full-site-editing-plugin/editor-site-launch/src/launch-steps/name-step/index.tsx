/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch } from '@wordpress/data';
import { __ as X__ } from '@wordpress/i18n';
import { Title, SubTitle } from '@automattic/onboarding';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../../stores';
import { LaunchStep } from '../../../../common/data-stores/launch/data';
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import './styles.scss';

const NameStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep } ) => {
	const { setStepComplete } = useDispatch( LAUNCH_STORE );

	const handleClick = () => {
		setStepComplete( LaunchStep.Name );
		onNextStep?.();
	};

	return (
		<LaunchStepContainer className="nux-launch-name-step">
			<div className="nux-launch-step__header">
				<div>
					<Title>{ X__( 'Name your site', 'full-site-editing' ) }</Title>
					<SubTitle>{ X__( 'Pick a name for your site.', 'full-site-editing' ) }</SubTitle>
				</div>
			</div>
			<div className="nux-launch-step__body">
				<p>
					For now, this page serves as a demo of how to mark a step as complete and go to the next
					step.
				</p>
				<Button onClick={ handleClick } isPrimary>
					Mark Complete &amp; Go To Next Step
				</Button>
			</div>
		</LaunchStepContainer>
	);
};

export default NameStep;
