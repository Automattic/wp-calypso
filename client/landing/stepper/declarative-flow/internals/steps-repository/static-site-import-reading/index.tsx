import {
	STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES,
	getStaticSiteImportErrorCode,
} from '@automattic/api-core';
import {
	createStaticSiteImportSessionMutation,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ProgressBar } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { Panel, useStaticSiteImportSource } from '../components/static-site-import';
import type { Step as StepType } from '../../types';
import type { StaticSiteImportState } from '@automattic/api-core';

import '../components/static-site-import/style.scss';
import './style.scss';

export const POLL_INTERVAL = 5000;

export type StaticSiteImportReadingSubmits =
	| { action: 'continue'; importSessionId: string }
	| { action: 'unavailable'; reason?: string };

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
				onSuccess: ( session ) => {
					setSearchParams(
						( params ) => {
							const nextParams = new URLSearchParams( params );
							nextParams.set( 'importSessionId', session.session_id );
							return nextParams;
						},
						{ replace: true }
					);
				},
			} );
		}, [ createSession, sessionId, sourceUrl, setSearchParams ] );

		const { data: session, error: pollError } = useQuery( {
			...staticSiteImportSessionQuery( sessionId ?? '' ),
			enabled: Boolean( sessionId ),
			refetchInterval: ( query ) => {
				const state = query.state.data?.state;
				return state && STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES.includes( state )
					? false
					: POLL_INTERVAL;
			},
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
					reason:
						getStaticSiteImportErrorCode( error ) ??
						session?.receipt?.code ??
						( sourceUrl ? 'failed' : 'missing_source' ),
				} );
				return;
			}
			if (
				sessionId &&
				session &&
				STATIC_SITE_IMPORT_CAPTURE_SETTLED_STATES.includes( session.state )
			) {
				hasSubmitted.current = true;
				navigation.submit?.( { action: 'continue', importSessionId: sessionId } );
			}
		}, [ createError, navigation, pollError, session, sessionId, sourceUrl ] );

		const progress = PROGRESS[ session?.state ?? 'capture_queued' ] ?? 100;
		const PROGRESS_LABELS: Partial< Record< StaticSiteImportState, string > > = {
			capturing: __( 'Reading pages' ),
			building: __( 'Almost done' ),
		};
		const progressLabel =
			PROGRESS_LABELS[ session?.state ?? 'capture_queued' ] ?? __( 'Getting started' );

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
					<Panel title={ __( 'What’s happening' ) }>
						<p className="static-site-import__muted">
							{ __(
								'We’re looking at your pages, blog posts, and images to see what we can move.'
							) }
						</p>
						<div className="static-site-import-reading__progress">
							<div className="static-site-import-reading__progress-labels">
								<span>{ __( 'Progress' ) }</span>
								<span className="static-site-import__muted" role="status">
									{ progressLabel }
								</span>
							</div>
							<ProgressBar className="static-site-import-reading__bar" value={ progress } />
						</div>
					</Panel>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportReading;
