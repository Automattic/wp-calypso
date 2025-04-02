import { recordTracksEvent } from '@automattic/calypso-analytics';
import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect } from 'react';
import { HintJetpackConnection } from './hint-jetpack-connection';
import { HintJetpackConnectionMovePlugin } from './hint-jetpack-connection-move-plugin';

import './style.scss';

export type NotAuthorizedType =
	| 'generic'
	| 'target-site-staging'
	| 'source-site-not-connected'
	| 'source-site-not-connected-move-plugin';

interface Props {
	type?: NotAuthorizedType;
	sourceSiteUrl?: string;
	targetSiteUrl?: string;
	startImport?: () => void;
	onBackToStart?: () => void;
	onStartBuilding?: () => void;
	onStartBuildingText?: string;
}

const NotAuthorized: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const {
		type = 'generic',
		sourceSiteUrl,
		targetSiteUrl,
		startImport,
		onBackToStart,
		onStartBuilding,
		onStartBuildingText,
	} = props;

	const startBuildingText = onStartBuildingText ?? __( 'Start building' );

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_unauthorized' );
	}, [] );

	return (
		<div className="import__not-authorized import-layout__center">
			<div className="import__header">
				<div className="import__heading  import__heading-center">
					{ type === 'generic' && (
						<>
							<Title>{ __( 'You are not authorized to import content' ) }</Title>
							<SubTitle>{ __( 'Please check with your site admin.' ) }</SubTitle>

							<div className="import__buttons-group">
								{ onStartBuilding && (
									<NextButton onClick={ onStartBuilding }>{ startBuildingText }</NextButton>
								) }
								{ onBackToStart && (
									<div>
										<BackButton onClick={ onBackToStart }>{ __( 'Back to start' ) }</BackButton>
									</div>
								) }
							</div>
						</>
					) }

					{ type === 'target-site-staging' && (
						<>
							<Title>
								{ __( 'You are not authorized to perform migration on the staging site' ) }
							</Title>

							<div className="import__buttons-group">
								{ onStartBuilding && (
									<NextButton onClick={ onStartBuilding }>{ startBuildingText }</NextButton>
								) }
							</div>
						</>
					) }

					{ type === 'source-site-not-connected' && (
						<>
							<Title>{ __( "We couldn't start the migration" ) }</Title>

							<HintJetpackConnection
								sourceSiteUrl={ sourceSiteUrl || '' }
								targetSiteUrl={ targetSiteUrl || '' }
							/>

							<div className="import__buttons-group">
								{ startImport && (
									<NextButton onClick={ startImport }>{ __( 'Try again' ) }</NextButton>
								) }
							</div>
						</>
					) }

					{ type === 'source-site-not-connected-move-plugin' && (
						<>
							<Title>{ __( "We couldn't start the migration" ) }</Title>

							<HintJetpackConnectionMovePlugin sourceSiteUrl={ sourceSiteUrl || '' } />

							<div className="import__buttons-group">
								{ startImport && (
									<NextButton onClick={ startImport }>{ __( 'Try again' ) }</NextButton>
								) }
							</div>
						</>
					) }
				</div>
			</div>
		</div>
	);
};

export default NotAuthorized;
