import { recordTracksEvent } from '@automattic/calypso-analytics';
import { BackButton, NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	onBackToStart?: () => void;
	onStartBuilding?: () => void;
	onStartBuildingText?: string;
}

const NotAuthorized: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { onBackToStart, onStartBuilding, onStartBuildingText } = props;

	const startBuildingText = onStartBuildingText ?? __( 'Start building' );

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_unauthorized' );
	}, [] );

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<FormattedHeader
					className="import__heading"
					headerText={ __( 'You are not authorized to import content' ) }
					subHeaderText={ __( 'Please check with your site admin.' ) }
				/>
			</div>
			<div className="import__buttons-group import__heading-center">
				{ onStartBuilding && (
					<NextButton onClick={ onStartBuilding }>{ startBuildingText }</NextButton>
				) }
				{ onBackToStart && (
					<div>
						<BackButton onClick={ onBackToStart }>{ __( 'Back to start' ) }</BackButton>
					</div>
				) }
			</div>
		</div>
	);
};

export default NotAuthorized;
