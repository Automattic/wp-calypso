/* eslint-disable wpcalypso/jsx-classname-namespace */
import { ProgressBar } from '@automattic/components';
import { SubTitle, Title, Progress, NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import type * as React from 'react';
import './style.scss';

const Summary: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className="import-layout__center import-light__summary">
			<div className="import__heading-center">
				<Progress>
					<Title>{ __( 'Wonderful!' ) }</Title>
					<ProgressBar value={ 99 } compact={ true } />
					<SubTitle>
						{ createInterpolateElement(
							sprintf(
								/* translators: the colorsNum could be any number from 0 to about ~10 */
								__( 'We imported <span>%(colorsNum)s color swatches.</span>' ),
								{ colorsNum: 4 }
							),
							{
								span: createElement( 'span' ),
							}
						) }
					</SubTitle>
					<NextButton>Continue</NextButton>
				</Progress>
			</div>
		</div>
	);
};

export default Summary;
