/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Title, SubTitle } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import LaunchStep, { Props as LaunchStepProps } from '../../launch-step';
import DomainPickerFSE from '../../../../editor-domain-picker/src/domain-picker-fse';
import './styles.scss';

const DomainStep: React.FunctionComponent< LaunchStepProps > = ( { onNextStep } ) => {
	return (
		<LaunchStep className="nux-launch-domain-step">
			<div className="nux-launch-step__header">
				<div>
					<Title>{ __( 'Choose a domain', 'full-site-editing' ) }</Title>
					<SubTitle>
						{ __( 'Free for the first year with any paid plan', 'full-site-editing' ) }
					</SubTitle>
				</div>
			</div>
			<div className="nux-launch-step__body">
				<DomainPickerFSE onSelect={ onNextStep } />
			</div>
		</LaunchStep>
	);
};

export default DomainStep;
