/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Title, SubTitle } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../../stores';
import { LaunchStep } from '../../../../common/data-stores/launch/data';
import LaunchStepContainer, { Props as LaunchStepProps } from '../../launch-step';
import DomainPickerFSE from '../../../../editor-domain-picker/src/domain-picker-fse';
import './styles.scss';

const DomainStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep } ) => {
	const { setStepComplete } = useDispatch( LAUNCH_STORE );

	const handleSelect = () => {
		setStepComplete( LaunchStep.Domain );
		onNextStep?.();
	};

	return (
		<LaunchStepContainer className="nux-launch-domain-step">
			<div className="nux-launch-step__header">
				<div>
					<Title>{ __( 'Choose a domain', 'full-site-editing' ) }</Title>
					<SubTitle>
						{ __( 'Free for the first year with any paid plan', 'full-site-editing' ) }
					</SubTitle>
				</div>
			</div>
			<div className="nux-launch-step__body">
				<DomainPickerFSE onSelect={ handleSelect } />
			</div>
		</LaunchStepContainer>
	);
};

export default DomainStep;
