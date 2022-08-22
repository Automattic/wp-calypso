import { recordTracksEvent } from '@automattic/calypso-analytics';
import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect } from 'react';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	onBackToStart?: () => void;
	onStartBuilding?: () => void;
}

const ErrorMessage: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { onBackToStart, onStartBuilding } = props;

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_start_import_failure' );
	}, [] );

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
						{ onStartBuilding && (
							<NextButton onClick={ onStartBuilding }>{ __( 'Start building' ) }</NextButton>
						) }
						{ onBackToStart && (
							<div>
								<BackButton onClick={ onBackToStart }>{ __( 'Back to start' ) }</BackButton>
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default ErrorMessage;
