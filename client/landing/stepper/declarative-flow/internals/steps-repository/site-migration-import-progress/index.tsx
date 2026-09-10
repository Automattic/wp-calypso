import {
	getStaticSiteImportErrorCode,
	STATIC_SITE_IMPORT_ERROR_CODES,
	STATIC_SITE_IMPORT_TERMINAL_STATES,
} from '@automattic/api-core';
import {
	approveStaticSiteImportSessionMutation,
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
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useFlowState } from '../../state-manager/store';
import type { Step as StepType } from '../../types';
import type { StaticSiteImportState } from '@automattic/api-core';

import './style.scss';

const POLL_INTERVAL = 5000;

const SLUG = 'site-migration-import-progress';

export type SiteMigrationImportProgressSubmits = {
	sessionId: string;
	archiveHash?: string;
	state?: StaticSiteImportState;
};

type FailureReason =
	| 'create'
	| 'source-url'
	| 'session-limit'
	| 'blocked'
	| 'disabled'
	| 'import-exists'
	| 'atomic-unavailable'
	| 'not-approvable'
	| 'already-approved'
	| 'stale-preview'
	| 'import'
	| 'missing';

const CODES = STATIC_SITE_IMPORT_ERROR_CODES;

/**
 * Which failure each error code is.
 *
 * Creating a session names no site, so nothing about a destination can be
 * reported here — a busy or ineligible destination only shows up at approval.
 */
const CREATE_FAILURES: Record< string, FailureReason > = {
	[ CODES.SESSION_LIMIT_EXCEEDED ]: 'session-limit',
	[ CODES.INVALID_SOURCE_URL ]: 'source-url',
	[ CODES.BLOCKED ]: 'blocked',
	[ CODES.DISABLED ]: 'disabled',
};

/**
 * Pick the failure an error means, falling back when the code is missing,
 * empty or one this screen has no separate message for.
 */
const failureFor = (
	error: unknown,
	failures: Record< string, FailureReason >,
	fallback: FailureReason
): FailureReason => {
	const code = getStaticSiteImportErrorCode( error );
	return ( code ? failures[ code ] : undefined ) ?? fallback;
};

/** Most of these are a 409, so only the code tells them apart. */
const APPROVE_FAILURES: Record< string, FailureReason > = {
	[ CODES.IMPORT_EXISTS ]: 'import-exists',
	[ CODES.ATOMIC_UNAVAILABLE ]: 'atomic-unavailable',
	[ CODES.NOT_APPROVABLE ]: 'not-approvable',
	[ CODES.ALREADY_APPROVED ]: 'already-approved',
	[ CODES.ARCHIVE_MISMATCH ]: 'stale-preview',
	[ CODES.BLOCKED ]: 'blocked',
	[ CODES.DISABLED ]: 'disabled',
};

const SiteMigrationImportProgress: StepType< {
	submits: SiteMigrationImportProgressSubmits;
} > = ( { navigation } ) => {
	const { __ } = useI18n();
	const { siteId } = useSiteData();
	const { get, set } = useFlowState();
	const [ searchParams, setSearchParams ] = useSearchParams();

	const persisted = get( SLUG );

	/** The address the user gave at the start of the flow. */
	const sourceUrl = searchParams.get( 'from' ) ?? get( 'site-migration-identify' )?.from ?? '';
	/**
	 * Deliberately not `sessionId`: Stepper already owns that query parameter for
	 * its own flow-state key (see utils/use-session-id), and it is present on
	 * every step URL. Reading it here picked up Stepper's short id, polled it as
	 * an import session — a guaranteed 404 — and, because it was truthy, made the
	 * create-on-mount effect below bail out, so no session was ever created.
	 */
	const sessionId = searchParams.get( 'importSessionId' ) ?? persisted?.sessionId ?? '';

	/**
	 * The archive hash the user actually reviewed. Approval is hash-bound, so
	 * without one there is nothing to approve against and this step must stay
	 * passive — landing here directly never imports on the user's behalf.
	 */
	const reviewedArchiveHash = searchParams.get( 'archiveHash' ) ?? persisted?.archiveHash ?? '';

	const [ failure, setFailure ] = useState< FailureReason | null >( null );

	const remember = useCallback(
		( next: { sessionId?: string; archiveHash?: string } ) => {
			const merged = {
				sessionId: next.sessionId ?? sessionId,
				archiveHash: next.archiveHash ?? reviewedArchiveHash,
			};

			set( SLUG, merged );

			const params = new URLSearchParams( searchParams );
			params.set( 'importSessionId', merged.sessionId );
			if ( merged.archiveHash ) {
				params.set( 'archiveHash', merged.archiveHash );
			}
			setSearchParams( params, { replace: true } );
		},
		[ reviewedArchiveHash, searchParams, sessionId, set, setSearchParams ]
	);

	const { mutate: createSession } = useMutation( createStaticSiteImportSessionMutation() );
	const createRequested = useRef( false );

	// Creating the session is what starts the read of the source site. It needs
	// the URL and nothing else, so it does not wait on the destination site.
	useEffect( () => {
		if ( sessionId || ! sourceUrl || createRequested.current ) {
			return;
		}

		createRequested.current = true;
		createSession( sourceUrl, {
			onSuccess: ( session ) => remember( { sessionId: session.session_id } ),
			onError: ( error ) => setFailure( failureFor( error, CREATE_FAILURES, 'create' ) ),
		} );
	}, [ createSession, remember, sessionId, sourceUrl ] );

	const { data: session, isError: isSessionError } = useReactQuery( {
		...staticSiteImportSessionQuery( sessionId ),
		enabled: Boolean( sessionId ),
		refetchInterval: ( query ) => {
			const state = query.state.data?.state;
			return state && STATIC_SITE_IMPORT_TERMINAL_STATES.includes( state ) ? false : POLL_INTERVAL;
		},
	} );

	const { mutate: approve } = useMutation( approveStaticSiteImportSessionMutation() );
	const approveRequested = useRef( false );

	useEffect( () => {
		if (
			approveRequested.current ||
			! siteId ||
			! session ||
			session.state !== 'preview_ready' ||
			! session.archive_hash ||
			! reviewedArchiveHash ||
			session.archive_hash !== reviewedArchiveHash
		) {
			return;
		}

		approveRequested.current = true;
		approve(
			{
				sessionId: session.session_id,
				archiveHash: session.archive_hash,
				destinationBlogId: siteId,
			},
			{
				onError: ( error ) => setFailure( failureFor( error, APPROVE_FAILURES, 'import' ) ),
			}
		);
	}, [ approve, reviewedArchiveHash, session, siteId ] );

	const submitted = useRef( false );

	useEffect( () => {
		if ( submitted.current || session?.state !== 'finished' ) {
			return;
		}

		submitted.current = true;
		navigation.submit( {
			sessionId: session.session_id,
			archiveHash: reviewedArchiveHash || undefined,
			state: 'finished',
		} );
	}, [ navigation, reviewedArchiveHash, session ] );

	const state = session?.state;
	const failureReason: FailureReason | null =
		failure ?? ( ! sessionId && ! sourceUrl ? 'missing' : null );
	// The destination is only needed to approve, so a missing one blocks the
	// button rather than the read that came before it.
	const canApprove = Boolean( siteId );
	const needsConfirmation =
		! failureReason &&
		state === 'preview_ready' &&
		Boolean( session?.archive_hash ) &&
		! reviewedArchiveHash;

	// Everything from 'import-exists' down happens at approval, after the wait, so
	// each one says that nothing was changed and what to do next.
	const failureCopy: Record< FailureReason, string > = {
		create: __( 'We couldn’t start reading your site.' ),
		'source-url': __( 'We couldn’t read that address. Check the site is public and try again.' ),
		'session-limit': __(
			'You already have imports running. Wait for one to finish, or cancel it.'
		),
		blocked: __( 'This site can’t import content.' ),
		disabled: __( 'Imports aren’t available for this account.' ),
		'import-exists': __(
			'This site already has an import running. Wait for it to finish, then refresh to try again.'
		),
		'atomic-unavailable': __(
			'Your plan can’t host an imported site. Nothing has changed. Upgrade the plan, then refresh to try again.'
		),
		'not-approvable': __( 'This import isn’t ready to start yet. Refresh the page to try again.' ),
		'already-approved': __( 'This import has already been sent to a different site.' ),
		'stale-preview': __( 'This preview is out of date, so we stopped before changing anything.' ),
		import: __( 'Something went wrong and your site wasn’t changed.' ),
		missing: __( 'We couldn’t find a migration to continue.' ),
	};

	let heading: string = __( 'Reading your site' );
	let body: string = __( 'This can take a few minutes. You can safely leave this page open.' );
	let showProgress = true;

	if ( failureReason ) {
		heading = __( 'We couldn’t finish your migration' );
		body = failureCopy[ failureReason ];
		showProgress = false;
	} else if ( isSessionError ) {
		heading = __( 'We couldn’t check on your migration' );
		body = __( 'Refresh the page to try again.' );
		showProgress = false;
	} else if ( state === 'failed' ) {
		heading = __( 'We couldn’t finish your migration' );
		body = __( 'Something went wrong and your site wasn’t changed.' );
		showProgress = false;
	} else if ( state === 'finished' ) {
		heading = __( 'Your site is ready' );
		body = __( 'Taking you to your new site.' );
	} else if ( needsConfirmation ) {
		heading = __( 'Ready to move your site' );
		body = __( 'Nothing has changed yet. Start the import when you’re ready.' );
		showProgress = false;
	} else if ( state === 'queued' ) {
		heading = __( 'Moving your site' );
		body = __( 'Your migration is queued and will start shortly.' );
	} else if ( state === 'preview_ready' ) {
		heading = __( 'Moving your site' );
		body = __( 'Starting your migration.' );
	} else if ( state === 'building' ) {
		heading = __( 'Building your site' );
		body = __( 'We’re turning your pages into WordPress content.' );
	} else if ( state ) {
		body = __( 'We’re collecting your pages, posts, and images.' );
	} else {
		heading = __( 'Getting things ready' );
		body = __( 'Hold tight while we set up your migration.' );
	}

	return (
		<>
			<DocumentHead title={ heading } />
			<Step.CenteredColumnLayout
				className="step-container-v2--site-migration-import-progress"
				columnWidth={ 6 }
				topBar={ <Step.TopBar /> }
				heading={ <Step.Heading text={ heading } subText={ body } /> }
			>
				<div className="site-migration-import-progress" data-testid="import-progress">
					{ showProgress && <ProgressBar className="site-migration-import-progress__progress" /> }
					{ needsConfirmation && (
						<Step.PrimaryButton
							onClick={ () => remember( { archiveHash: session?.archive_hash } ) }
							disabled={ ! session?.archive_hash || ! canApprove }
						>
							{ __( 'Start the import' ) }
						</Step.PrimaryButton>
					) }
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationImportProgress;
