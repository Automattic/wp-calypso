import {
	STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES,
	getStaticSiteImportErrorCode,
} from '@automattic/api-core';
import {
	createStaticSiteImportSessionMutation,
	pollStaticSiteImportSessionUntil,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	ProgressBar,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { ImportCard, useStaticSiteImportSource } from '../components/static-site-import';
import type { Step as StepType } from '../../types';
import type { StaticSiteImportState } from '@automattic/api-core';

import './style.scss';

export type StaticSiteImportReadingSubmits =
	{ action: 'continue'; importSessionId: string } | { action: 'unavailable'; reason?: string };

const PROGRESS: Partial< Record< StaticSiteImportState, number > > = {
	capture_queued: 10,
	capturing: 45,
	building: 85,
};

const StaticSiteImportReading: StepType< { submits: StaticSiteImportReadingSubmits } > =
	function StaticSiteImportReading( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams, setSearchParams ] = useSearchParams();
		const { sourceUrl, platformName } = useStaticSiteImportSource();
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
					setSearchParams(
						( params ) => {
							const nextParams = new URLSearchParams( params );
							nextParams.set( 'importSessionId', session.session_id );
							return nextParams;
						},
						{ replace: true }
					),
			} );
		}, [ createSession, sessionId, sourceUrl, setSearchParams ] );

		const { data: session, error: pollError } = useQuery( {
			...staticSiteImportSessionQuery( sessionId ?? '' ),
			enabled: Boolean( sessionId ),
			refetchInterval: pollStaticSiteImportSessionUntil(
				STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES
			),
		} );

		const hasSubmitted = useRef( false );
		useEffect( () => {
			if ( hasSubmitted.current ) {
				return;
			}
			const error = createError ?? pollError;
			if ( ! sourceUrl || error || session?.state === 'failed' ) {
				hasSubmitted.current = true;
				navigation.submit?.( {
					action: 'unavailable',
					reason: getStaticSiteImportErrorCode( error ) ?? session?.receipt?.code,
				} );
			} else if (
				sessionId &&
				session &&
				STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES.includes( session.state )
			) {
				hasSubmitted.current = true;
				navigation.submit?.( { action: 'continue', importSessionId: sessionId } );
			}
		}, [ createError, navigation, pollError, session, sessionId, sourceUrl ] );

		const state = session?.state ?? 'capture_queued';
		const progressLabel =
			{ capturing: __( 'Reading pages' ), building: __( 'Almost done' ) }[ state as string ] ??
			__( 'Getting started' );

		return (
			<>
				<DocumentHead title={ __( 'Reading your site' ) } />
				<Step.CenteredColumnLayout
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
					<ImportCard title={ __( 'What’s happening' ) }>
						<Text variant="muted">
							{ __(
								'We’re looking at your pages, blog posts, and images to see what we can move.'
							) }
						</Text>
						<VStack spacing={ 3 }>
							<HStack justify="space-between">
								<Text>{ __( 'Progress' ) }</Text>
								<Text variant="muted" role="status">
									{ progressLabel }
								</Text>
							</HStack>
							<ProgressBar
								className="static-site-import-reading__bar"
								value={ PROGRESS[ state ] ?? 100 }
							/>
						</VStack>
					</ImportCard>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportReading;
