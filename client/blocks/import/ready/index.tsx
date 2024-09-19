import { Onboard } from '@automattic/data-stores';
import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useState } from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { UrlData, GoToStep, RecordTracksEvent } from '../types';
import { convertPlatformName, convertToFriendlyWebsiteName } from '../util';
import ImportPlatformDetails, { coveredPlatforms } from './platform-details';
import ImportPreview from './preview';
import type { OnboardSelect } from '@automattic/data-stores';
import type { ImporterPlatform } from 'calypso/lib/importer/types';
import './style.scss';

const trackEventName = 'calypso_signup_step_start';
const trackEventParams = {
	flow: 'importer',
	step: 'ready',
};

interface ReadyPreviewProps {
	urlData: UrlData;
	siteSlug: string;
	goToImporterPage: ( platform: ImporterPlatform ) => void;
	recordTracksEvent: RecordTracksEvent;
}

const ReadyPreviewStep: React.FunctionComponent< ReadyPreviewProps > = ( {
	urlData,
	goToImporterPage,
	recordTracksEvent,
} ) => {
	const { __ } = useI18n();
	const [ isModalDetailsOpen, setIsModalDetailsOpen ] = useState( false );

	const recordReadyScreenEvent = () => {
		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'preview',
			platform: urlData.platform,
		} );
	};

	const recordImportGuideEvent = () => {
		if ( ! isModalDetailsOpen ) {
			return;
		}

		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'guide-modal',
			platform: urlData.platform,
		} );
	};

	useEffect( () => recordReadyScreenEvent(), [ urlData.platform ] );
	useEffect( () => recordImportGuideEvent(), [ isModalDetailsOpen ] );

	return (
		<>
			<div className="import__heading import__heading-center">
				<Title>{ __( 'Your content is ready for its brand new home' ) }</Title>
				<SubTitle>
					{ createInterpolateElement(
						sprintf(
							/* translators: the website could be any domain (eg: "yourname.com") that is built with a platform (eg: Wix, Squarespace, Blogger, etc.) */
							__(
								'It looks like <strong>%(website)s</strong> is built with %(platform)s. To move your existing content to your newly created WordPress.com site, try our %(platform)s importer.'
							),
							{
								website: convertToFriendlyWebsiteName( urlData.url ),
								platform: convertPlatformName( urlData.platform ),
							}
						),
						{ strong: createElement( 'strong' ) }
					) }
				</SubTitle>

				<div className="import__buttons-group">
					<NextButton onClick={ () => goToImporterPage( urlData.platform ) }>
						{ __( 'Import your content' ) }
					</NextButton>
					{ coveredPlatforms.includes( urlData.platform ) && (
						<div>
							<BackButton onClick={ setIsModalDetailsOpen.bind( this, true ) }>
								{ __( 'What can be imported?' ) }
							</BackButton>
						</div>
					) }
				</div>
			</div>

			<div className="import__content">
				<ImportPreview website={ urlData.url } />
			</div>

			{ isModalDetailsOpen && (
				<ImportPlatformDetails
					platform={ urlData.platform }
					fromSite={ urlData?.url }
					onClose={ setIsModalDetailsOpen.bind( this, false ) }
				/>
			) }
		</>
	);
};

interface ReadyNotProps {
	goToStep: GoToStep;
	recordTracksEvent: RecordTracksEvent;
}

const ReadyNotStep: React.FunctionComponent< ReadyNotProps > = ( {
	goToStep,
	recordTracksEvent,
} ) => {
	const { __ } = useI18n();
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[]
	);
	const { setGoals } = useDispatch( ONBOARD_STORE );

	const recordReadyScreenEvent = () => {
		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'not',
		} );
	};

	const recordBackToStartEvent = () => {
		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'back-to-start',
		} );
	};

	const onBackBtnClick = () => {
		recordBackToStartEvent();
		goToStep( 'capture' );
	};

	const onBackToGoalsBtnClick = () => {
		// clean up the import goal
		const goalSet = new Set( goals );
		goalSet.delete( Onboard.SiteGoal.Import );
		setGoals( Array.from( goalSet ) );
		goToStep( 'goals' );
	};

	useEffect( recordReadyScreenEvent, [] );

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading import__heading-center">
					<Title>{ __( "Your existing content can't be imported" ) }</Title>
					<SubTitle>
						{ __(
							"Unfortunately, your content is on a platform that we don't yet support. Try Building a new WordPress site instead."
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton onClick={ onBackToGoalsBtnClick }>{ __( 'Back to goals' ) }</NextButton>
						<div>
							<BackButton onClick={ onBackBtnClick }>{ __( 'Back to start' ) }</BackButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

interface ReadyProps {
	platform: ImporterPlatform;
	goToImporterPage: ( platform: ImporterPlatform ) => void;
	recordTracksEvent: RecordTracksEvent;
	fromSite: UrlData[ 'url' ];
}

const ReadyStep: React.FunctionComponent< ReadyProps > = ( props ) => {
	const { platform, goToImporterPage, recordTracksEvent, fromSite } = props;
	const { __ } = useI18n();
	const [ isModalDetailsOpen, setIsModalDetailsOpen ] = React.useState( false );

	const recordReadyScreenEvent = () => {
		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'regular',
			platform,
		} );
	};

	const recordImportGuideEvent = () => {
		if ( ! isModalDetailsOpen ) {
			return;
		}

		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'guide-modal',
			platform,
		} );
	};

	useEffect( recordReadyScreenEvent, [] );
	useEffect( recordImportGuideEvent, [ isModalDetailsOpen ] );

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading import__heading-center">
					<Title>{ __( 'Your content is ready for its new home' ) }</Title>
					<SubTitle>
						{ sprintf(
							/* translators: platform name (eg: Wix, Squarespace, Blogger, etc.) */
							__(
								'To move your existing %(platform)s hosted content to your newly created WordPress.com site, try our %(platform)s importer.'
							),
							{
								platform: convertPlatformName( platform ),
							}
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton onClick={ () => goToImporterPage( platform ) }>
							{ __( 'Import your content' ) }
						</NextButton>
						{ coveredPlatforms.includes( platform ) && (
							<div>
								<BackButton onClick={ setIsModalDetailsOpen.bind( this, true ) }>
									{ __( 'View the import guide' ) }
								</BackButton>
							</div>
						) }
					</div>
				</div>
			</div>
			{ isModalDetailsOpen && (
				<ImportPlatformDetails
					platform={ platform }
					fromSite={ fromSite }
					onClose={ setIsModalDetailsOpen.bind( this, false ) }
				/>
			) }
		</div>
	);
};

interface ReadyWpComProps {
	urlData: UrlData;
	goToStep: GoToStep;
	recordTracksEvent: RecordTracksEvent;
}

const ReadyAlreadyOnWPCOMStep: React.FunctionComponent< ReadyWpComProps > = ( {
	urlData,
	goToStep,
	recordTracksEvent,
} ) => {
	const { __ } = useI18n();
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[]
	);
	const { setGoals } = useDispatch( ONBOARD_STORE );

	const recordReadyScreenEvent = () => {
		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'already-wpcom',
			platform: urlData.platform,
		} );
	};

	const recordBackToStartEvent = () => {
		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'back-to-start',
		} );
	};

	const recordStartBuildingEvent = () => {
		recordTracksEvent( trackEventName, {
			...trackEventParams,
			action: 'start-building',
		} );
	};

	const onBackBtnClick = () => {
		recordBackToStartEvent();
		goToStep( 'capture' );
	};

	const onBackToGoalsBtnClick = () => {
		// event tracking
		recordStartBuildingEvent();
		// clean up the import goal
		const goalSet = new Set( goals );
		goalSet.delete( Onboard.SiteGoal.Import );
		setGoals( Array.from( goalSet ) );
		goToStep( 'goals' );
	};

	useEffect( recordReadyScreenEvent, [] );

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading import__heading-center">
					<Title>{ __( 'Your site is already on WordPress.com' ) }</Title>
					<SubTitle>
						{ createInterpolateElement(
							sprintf(
								/* translators: the website could be any domain (eg: "yourname.com") */
								__(
									'It looks like <strong>%(website)s</strong> is already on WordPress.com. Try a different address or start building a new site instead.'
								),
								{
									website: convertToFriendlyWebsiteName( urlData.url ),
								}
							),
							{ strong: createElement( 'strong' ) }
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton onClick={ onBackToGoalsBtnClick }>{ __( 'Back to goals' ) }</NextButton>
						<div>
							<BackButton onClick={ onBackBtnClick }>{ __( 'Back to start' ) }</BackButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export { ReadyPreviewStep, ReadyNotStep, ReadyStep, ReadyAlreadyOnWPCOMStep };
