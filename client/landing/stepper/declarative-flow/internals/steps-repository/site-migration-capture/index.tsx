import {
	getStaticSiteImportErrorCode,
	STATIC_SITE_IMPORT_ERROR_CODES,
	STATIC_SITE_IMPORT_TERMINAL_STATES,
} from '@automattic/api-core';
import {
	createStaticSiteImportSessionMutation,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery as useReactQuery } from '@tanstack/react-query';
import { ProgressBar } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { getMigrationWizardSteps } from '../../../flows/site-migration-flow/wizard-steps';
import { useFlowState } from '../../state-manager/store';
import { MigrationWizardProgress } from '../components/migration-wizard-progress';
import type { Step as StepType } from '../../types';
import type { StaticSiteImportState } from '@automattic/api-core';

import './style.scss';

const POLL_INTERVAL = 5000;

const SLUG = 'site-migration-capture';

export type SiteMigrationCaptureSubmits = {
	sessionId: string;
	state?: StaticSiteImportState;
};

/**
 * Everything that can go wrong here happens before the user has picked a plan or
 * paid for anything, so none of this copy talks about a site being changed.
 */
type FailureReason =
	| 'create'
	| 'source-url'
	| 'session-limit'
	| 'blocked'
	| 'disabled'
	| 'capture'
	| 'read'
	| 'missing';

const CODES = STATIC_SITE_IMPORT_ERROR_CODES;

/** Creating a session names no site, so only these four can come back from it. */
const CREATE_FAILURES: Record< string, FailureReason > = {
	[ CODES.SESSION_LIMIT_EXCEEDED ]: 'session-limit',
	[ CODES.INVALID_SOURCE_URL ]: 'source-url',
	[ CODES.BLOCKED ]: 'blocked',
	[ CODES.DISABLED ]: 'disabled',
};

const failureFor = ( error: unknown ): FailureReason => {
	const code = getStaticSiteImportErrorCode( error );
	return ( code ? CREATE_FAILURES[ code ] : undefined ) ?? 'create';
};

/**
 * Reads the source site.
 *
 * This is the only screen that starts the read, and it runs before a destination
 * site, a plan or a payment exists — the session belongs to the user, not to a
 * site, so nothing here needs one. The user can carry on down the flow as soon as
 * the session exists; the read keeps going in the background and Review picks the
 * same session back up.
 */
const SiteMigrationCapture: StepType< {
	submits: SiteMigrationCaptureSubmits;
} > = ( { navigation } ) => {
	const { __ } = useI18n();
	const { get, set } = useFlowState();
	const [ searchParams, setSearchParams ] = useSearchParams();

	const persisted = get( SLUG );

	/** The address the user gave on the first screen. */
	const sourceUrl = searchParams.get( 'from' ) ?? get( 'site-migration-identify' )?.from ?? '';
	/**
	 * Deliberately not `sessionId`: Stepper owns that query parameter for its own
	 * flow-state key (see utils/use-session-id) and puts it on every step URL.
	 */
	const sessionId = searchParams.get( 'importSessionId' ) ?? persisted?.sessionId ?? '';

	const [ failure, setFailure ] = useState< FailureReason | null >( null );

	const remember = useCallback(
		( nextSessionId: string ) => {
			set( SLUG, { sessionId: nextSessionId } );

			const params = new URLSearchParams( searchParams );
			params.set( 'importSessionId', nextSessionId );
			setSearchParams( params, { replace: true } );
		},
		[ searchParams, set, setSearchParams ]
	);

	const { mutate: createSession } = useMutation( createStaticSiteImportSessionMutation() );
	const createRequested = useRef( false );

	useEffect( () => {
		if ( sessionId || ! sourceUrl || createRequested.current ) {
			return;
		}

		createRequested.current = true;
		createSession( sourceUrl, {
			onSuccess: ( session ) => remember( session.session_id ),
			onError: ( error ) => setFailure( failureFor( error ) ),
		} );
	}, [ createSession, remember, sessionId, sourceUrl ] );

	const { data: session, isError: isSessionError } = useReactQuery( {
		...staticSiteImportSessionQuery( sessionId ),
		enabled: Boolean( sessionId ),
		refetchInterval: ( query ) => {
			const state = query.state.data?.state;
			// The read is done at `preview_ready`; the rest of the states only happen
			// after approval, which is not this screen's job.
			if ( ! state ) {
				return POLL_INTERVAL;
			}
			return state === 'preview_ready' || STATIC_SITE_IMPORT_TERMINAL_STATES.includes( state )
				? false
				: POLL_INTERVAL;
		},
	} );

	const state = session?.state;
	const submitted = useRef( false );

	/**
	 * The wait ends here, not on the next screen. Review cannot do anything without
	 * an archive hash, so letting the user leave early would only move the same wait
	 * one screen forward behind a control that suggests otherwise.
	 */
	useEffect( () => {
		if ( submitted.current || ! sessionId || state !== 'preview_ready' ) {
			return;
		}

		submitted.current = true;
		navigation.submit( { sessionId, state } );
	}, [ navigation, sessionId, state ] );

	const failureReason: FailureReason | null =
		failure ??
		( ! sessionId && ! sourceUrl ? 'missing' : null ) ??
		( state === 'failed' ? 'capture' : null ) ??
		( isSessionError ? 'read' : null );

	/**
	 * No plan has been chosen and no payment has been taken at this point, so every
	 * message says what to do next rather than reassuring the user about a site.
	 */
	const failureCopy: Record< FailureReason, string > = {
		create: __( 'We couldn’t start reading your site. Check the address and try again.' ),
		'source-url': __( 'We couldn’t read that address. Check the site is public, then try again.' ),
		'session-limit': __(
			'You already have imports running. Wait for one to finish, or cancel it, then try again.'
		),
		blocked: __( 'This site can’t be imported.' ),
		disabled: __( 'Imports aren’t available for this account.' ),
		capture: __( 'We couldn’t read your site. Try a different address.' ),
		read: __( 'We lost track of the read. Refresh the page to try again.' ),
		missing: __( 'We need the address of the site you want to move.' ),
	};

	// The user waits here, so say which part of the job is running rather than
	// showing one unchanging spinner for the whole minute.
	let heading: string = __( 'Reading your site' );
	let body: string = __( 'Hold tight while we open your site. This usually takes about a minute.' );

	if ( failureReason ) {
		heading = __( 'We couldn’t read your site' );
		body = failureCopy[ failureReason ];
	} else if ( state === 'capturing' ) {
		body = __( 'We’re collecting your pages, posts, and images.' );
	} else if ( state === 'building' ) {
		heading = __( 'Building your site' );
		body = __( 'We’re turning your pages into WordPress content.' );
	} else if ( state === 'preview_ready' ) {
		heading = __( 'We’ve read your site' );
		body = __( 'Taking you to the next step.' );
	}

	return (
		<>
			<DocumentHead title={ heading } />
			<Step.CenteredColumnLayout
				className="step-container-v2--site-migration-capture"
				columnWidth={ 6 }
				topBar={
					<Step.TopBar
						centerElement={
							<MigrationWizardProgress steps={ getMigrationWizardSteps() } current={ SLUG } />
						}
					/>
				}
				heading={ <Step.Heading text={ heading } subText={ body } /> }
			>
				<div className="site-migration-capture" data-testid="import-capture">
					{ failureReason ? (
						// A failure is the only way off this step other than finishing, so it
						// always offers one.
						navigation.goBack && (
							<Step.PrimaryButton onClick={ navigation.goBack }>
								{ __( 'Try a different address' ) }
							</Step.PrimaryButton>
						)
					) : (
						<ProgressBar className="site-migration-capture__progress" />
					) }
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationCapture;
