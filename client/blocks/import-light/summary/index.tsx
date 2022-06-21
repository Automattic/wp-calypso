/* eslint-disable wpcalypso/jsx-classname-namespace */
import { SubTitle, Title, Progress, NextButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import illustrationCheck from 'calypso/assets/images/illustrations/success-check.svg';
import type * as React from 'react';
import './style.scss';

interface Props {
	colorsNum: number;
}
const Summary: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { colorsNum } = props;

	return (
		<div className="import-layout__center import-light__summary">
			<div className="import__heading-center">
				<Progress>
					<img alt="Success" src={ illustrationCheck } aria-hidden="true" />
					<Title>{ __( 'Wonderful!' ) }</Title>
					<SubTitle>
						{ createInterpolateElement(
							sprintf(
								/* translators: the colorsNum could be any number from 0 to about ~10 */
								__( 'We imported <span>%(colorsNum)s color swatches.</span>' ),
								{ colorsNum: colorsNum }
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
