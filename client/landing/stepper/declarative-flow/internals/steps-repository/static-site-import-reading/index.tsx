import { getStaticSiteImportErrorCode } from '@automattic/api-core';
import { createStaticSiteImportSessionMutation } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useEffectEvent, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useStaticSiteImportSource } from '../components/static-site-import';
import type { Step as StepType } from '../../types';

export type StaticSiteImportReadingSubmits =
	{ action: 'continue'; importSessionId: string } | { action: 'unavailable' };

const StaticSiteImportReading: StepType< { submits: StaticSiteImportReadingSubmits } > =
	function StaticSiteImportReading( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const { sourceUrl } = useStaticSiteImportSource();
		// Not `sessionId`: Stepper uses that param for its own flow state.
		const sessionId = searchParams.get( 'importSessionId' );

		const { mutate: createSession, error } = useMutation( createStaticSiteImportSessionMutation() );
		const isRefused = getStaticSiteImportErrorCode( error ) === 'static_site_import_source_refused';

		const submit = useEffectEvent( ( result: StaticSiteImportReadingSubmits ) =>
			navigation.submit?.( result )
		);
		const hasStarted = useRef( false );
		useEffect( () => {
			if ( hasStarted.current ) {
				return;
			}
			hasStarted.current = true;
			if ( sessionId ) {
				return submit( { action: 'continue', importSessionId: sessionId } );
			}
			if ( ! sourceUrl ) {
				return submit( { action: 'unavailable' } );
			}
			createSession( sourceUrl, {
				onSuccess: ( session ) =>
					submit( { action: 'continue', importSessionId: session.session_id } ),
				onError: ( createError ) => {
					if (
						getStaticSiteImportErrorCode( createError ) !== 'static_site_import_source_refused'
					) {
						submit( { action: 'unavailable' } );
					}
				},
			} );
		}, [ createSession, sessionId, sourceUrl ] );

		if ( isRefused ) {
			return (
				<>
					<DocumentHead title={ __( 'We can’t import this site' ) } />
					<Step.CenteredColumnLayout
						columnWidth={ 8 }
						topBar={ <Step.TopBar /> }
						heading={
							<Step.Heading
								text={ __( 'We can’t import this site' ) }
								subText={ __( 'Its content isn’t allowed on WordPress.com.' ) }
							/>
						}
					/>
				</>
			);
		}

		return (
			<>
				<DocumentHead title={ __( 'Checking your site' ) } />
				<Step.Loading title={ __( 'Checking your site' ) } />
			</>
		);
	};

export default StaticSiteImportReading;
