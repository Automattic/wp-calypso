import { STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES } from '@automattic/api-core';
import {
	createStaticSiteImportSessionMutation,
	pollStaticSiteImportSessionUntil,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	ExternalLink,
	ProgressBar,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { ImportCard, useStaticSiteImportSource } from '../components/static-site-import';
import type { Step as StepType } from '../../types';

import './style.scss';

const COMPLETION_DELAY_MS = 1500;

export type StaticSiteImportReadingSubmits =
	| { action: 'session-created'; importSessionId: string }
	| { action: 'continue'; importSessionId: string }
	| { action: 'unavailable' };

const StaticSiteImportReading: StepType< { submits: StaticSiteImportReadingSubmits } > =
	function StaticSiteImportReading( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const { sourceUrl, host, platformName } = useStaticSiteImportSource();
		// Not `sessionId`: Stepper uses that param for its own flow state.
		const sessionId = searchParams.get( 'importSessionId' );

		const { mutate: createSession, error: createError } = useMutation(
			createStaticSiteImportSessionMutation()
		);
		const hasRequestedSession = useRef( false );

		useEffect( () => {
			if ( sessionId || ! sourceUrl || hasRequestedSession.current ) {
				return;
			}
			hasRequestedSession.current = true;
			createSession( sourceUrl, {
				onSuccess: ( session ) =>
					navigation.submit?.( { action: 'session-created', importSessionId: session.session_id } ),
			} );
		}, [ createSession, navigation, sessionId, sourceUrl ] );

		const { data: session, error: pollError } = useQuery( {
			...staticSiteImportSessionQuery( sessionId ?? '' ),
			enabled: Boolean( sessionId ),
			refetchInterval: pollStaticSiteImportSessionUntil(
				STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES
			),
		} );
		const state = createError || pollError ? 'failed' : ( session?.state ?? 'capture_queued' );
		const isFailed = state === 'failed';
		const isReady = ! isFailed && STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES.includes( state );

		const hasSubmitted = useRef( false );
		const submitResult = useEffectEvent( ( result: StaticSiteImportReadingSubmits ) => {
			hasSubmitted.current = true;
			navigation.submit?.( result );
		} );
		useEffect( () => {
			if ( hasSubmitted.current ) {
				return;
			}
			if ( ! sourceUrl || isFailed ) {
				submitResult( { action: 'unavailable' } );
			} else if ( sessionId && isReady ) {
				const timeout = setTimeout( () => {
					submitResult( { action: 'continue', importSessionId: sessionId } );
				}, COMPLETION_DELAY_MS );
				return () => clearTimeout( timeout );
			}
		}, [ isFailed, isReady, sessionId, sourceUrl ] );

		const { phase, finding_pages: findingPages } = session?.progress ?? {};
		const [ lastPageCounts, setLastPageCounts ] = useState( {
			sessionId,
			captured: 0,
			total: 0,
		} );
		const pagesCaptured =
			session?.progress?.pages_captured ??
			( lastPageCounts.sessionId === sessionId ? lastPageCounts.captured : 0 );
		const pagesTotal =
			session?.progress?.pages_total ??
			( lastPageCounts.sessionId === sessionId ? lastPageCounts.total : 0 );
		if (
			lastPageCounts.sessionId !== sessionId ||
			lastPageCounts.captured !== pagesCaptured ||
			lastPageCounts.total !== pagesTotal
		) {
			setLastPageCounts( { sessionId, captured: pagesCaptured, total: pagesTotal } );
		}
		const pagesProgress =
			pagesTotal > 0 ? Math.min( 100, ( pagesCaptured / pagesTotal ) * 100 ) : 0;

		let activeStage: 'finding' | 'pages' | 'images' | 'design' | undefined;
		if ( ! isReady && ! isFailed ) {
			if ( state === 'building' || phase === 'building' || phase === 'exporting' ) {
				activeStage = 'design';
			} else if (
				state === 'capture_queued' ||
				phase === 'installing' ||
				phase === 'inspecting' ||
				findingPages
			) {
				activeStage = 'finding';
			} else {
				activeStage = pagesTotal > 0 && pagesCaptured === pagesTotal ? 'images' : 'pages';
			}
		}

		const stages = [
			{
				id: 'finding',
				label: __( 'Finding your site' ),
				message: __( 'Finding your site' ),
			},
			{
				id: 'pages',
				label: __( 'Pages' ),
				message: __( 'Reading your pages' ),
				progress: pagesProgress,
			},
			{
				id: 'images',
				label: __( 'Images' ),
				message: __( 'Reading your images' ),
			},
			{
				id: 'design',
				label: __( 'Design' ),
				message: __( 'Checking your fonts, colors, and layout' ),
			},
		];
		const activeStageIndex = stages.findIndex( ( stage ) => stage.id === activeStage );
		const progressLabel =
			stages[ activeStageIndex ]?.message ??
			( isReady ? __( 'Your site is ready' ) : __( 'We couldn’t read your site' ) );

		return (
			<>
				<DocumentHead title={ __( 'Reading your site' ) } />
				<Step.CenteredColumnLayout
					className="step-container-v2--static-site-import-reading"
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ __( 'Reading your site' ) }
							subText={
								platformName
									? sprintf(
											/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
											__( 'This can take a few minutes. Your %s site stays live and unchanged.' ),
											platformName
										)
									: __( 'This can take a few minutes. Your current site stays live and unchanged.' )
							}
						/>
					}
				>
					<VStack spacing={ 6 }>
						{ host && (
							<Card>
								<CardBody>
									<HStack wrap>
										<span>{ host }</span>
										<ExternalLink href={ sourceUrl }>
											{ platformName
												? sprintf(
														/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
														__( '%s site' ),
														platformName
													)
												: __( 'Current site' ) }
										</ExternalLink>
									</HStack>
								</CardBody>
							</Card>
						) }
						<ImportCard>
							<HStack justify="flex-start" spacing={ 2 } role="status">
								{ ! isReady && ! isFailed && (
									<Spinner className="static-site-import-reading__spinner" />
								) }
								<Text size={ 16 } weight={ 500 }>
									{ progressLabel }
								</Text>
							</HStack>
							<div className="static-site-import-reading__progress">
								{ stages.map( ( stage, index ) => {
									let value = index === activeStageIndex ? stage.progress : 0;
									if ( isReady || index < activeStageIndex ) {
										value = 100;
									}
									return (
										<VStack key={ stage.id } spacing={ 2 }>
											<ProgressBar
												className="static-site-import-reading__bar"
												value={ value }
												aria-label={ stage.label }
											/>
											<Text variant="muted" size={ 14 }>
												{ stage.label }
											</Text>
										</VStack>
									);
								} ) }
							</div>
							<Text variant="muted" size={ 14 }>
								{ host
									? sprintf(
											/* translators: %s: the site's domain, e.g. example.com. */
											__( 'We’re looking at %s to see what we can move.' ),
											host
										)
									: __( 'We’re looking at your site to see what we can move.' ) }
							</Text>
						</ImportCard>
					</VStack>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportReading;
