import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import React from 'react';
import { getStepUrl } from 'calypso/signup/utils';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	siteSlug: string;
}

const ErrorMessage: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { siteSlug } = props;

	/**
	 ↓ Methods
	 */
	const backToStart = (): void => {
		page( getStepUrl( 'importer', 'capture', '', '', { siteSlug } ) );
	};

	const backToIntent = (): void => {
		page( getStepUrl( 'setup-site', 'intent', '', '', { siteSlug } ) );
	};

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading import__heading-center">
					<Title>
						{ createInterpolateElement( __( 'Oops, <br />something went wrong.' ), {
							br: createElement( 'br' ),
						} ) }
					</Title>
					<SubTitle>{ __( 'Please try again soon or contact support for help.' ) }</SubTitle>

					<div className="import__buttons-group">
						<NextButton onClick={ backToIntent }>{ __( 'Start building' ) }</NextButton>
						<div>
							<BackButton onClick={ backToStart }>{ __( 'Back to start' ) }</BackButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ErrorMessage;
