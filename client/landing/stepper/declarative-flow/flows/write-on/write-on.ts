import config from '@automattic/calypso-config';
import { OnboardActions } from '@automattic/data-stores';
import { WRITE_ON_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { type FlowV2, type SubmitHandler } from '../../internals/types';

export const ANON_DRAFT_STORAGE_KEY = 'wpcom-write-anon-draft';

// Cap the localStorage payload at ~200K characters. A long blog post in
// Gutenberg block markup is well under 100K; anything larger is almost
// certainly corrupted or hostile and is treated as "no draft."
export const MAX_DRAFT_SIZE = 200_000;

type AnonDraft = {
	title: string;
	content: string;
};

function readAnonDraft(): AnonDraft | null {
	try {
		const raw = window.localStorage.getItem( ANON_DRAFT_STORAGE_KEY );
		if ( ! raw || raw.length > MAX_DRAFT_SIZE ) {
			return null;
		}
		const parsed = JSON.parse( raw );
		if ( ! parsed || typeof parsed !== 'object' ) {
			return null;
		}
		const title = typeof parsed.title === 'string' ? parsed.title : '';
		const content = typeof parsed.content === 'string' ? parsed.content : '';
		if ( ! title && ! content ) {
			return null;
		}
		return { title, content };
	} catch {
		// Treat unreadable storage as "no draft" — the side-effect handler will
		// redirect to standard onboarding rather than running an empty flow.
	}
	return null;
}

function clearAnonDraft() {
	try {
		window.localStorage.removeItem( ANON_DRAFT_STORAGE_KEY );
	} catch {
		// Ignore — failing to clear leaves the draft for a future visit, which
		// is harmless.
	}
}

function initialize() {
	// Phase 1 is staging-only; the companion endpoint is proxy-gated so the
	// flow has nothing to land users on in production. Redirect to the
	// standard onboarding flow when the feature flag is off.
	if ( ! config.isEnabled( 'calypso/write-on-flow' ) ) {
		recordTracksEvent( 'calypso_write_on_flow_blocked', { reason: 'flag_off' } );
		window.location.replace( '/setup/onboarding' );
		return [];
	}
	return stepsWithRequiredLogin( [ STEPS.SITE_CREATION_STEP, STEPS.PROCESSING ] );
}

const writeOn: FlowV2< typeof initialize > = {
	name: WRITE_ON_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useSideEffect( currentStepSlug ) {
		const { setSiteTitle } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const hasRunEntryChecks = useRef( false );

		// Entry checks must fire at most once per mount. Re-running them on a
		// later isLoggedIn flip (e.g. mid-signup) would redirect the user out of
		// the flow during the auth round-trip.
		useEffect( () => {
			if ( hasRunEntryChecks.current ) {
				return;
			}
			hasRunEntryChecks.current = true;
			if ( currentStepSlug ) {
				// The flow already advanced past entry — entry checks aren't needed.
				return;
			}

			// Phase 1 is a logged-out fake door. If the visitor is already
			// authenticated they should not be here — send them to the standard
			// onboarding flow.
			if ( isLoggedIn ) {
				recordTracksEvent( 'calypso_write_on_flow_blocked', { reason: 'logged_in' } );
				window.location.replace( '/setup/onboarding' );
				return;
			}

			const draft = readAnonDraft();
			if ( ! draft ) {
				recordTracksEvent( 'calypso_write_on_flow_blocked', { reason: 'no_draft' } );
				window.location.replace( '/setup/onboarding' );
				return;
			}

			recordTracksEvent( 'calypso_write_on_flow_entered', {
				draft_size: draft.title.length + draft.content.length,
			} );

			if ( draft.title ) {
				setSiteTitle( draft.title );
			}
		}, [ currentStepSlug, isLoggedIn, setSiteTitle ] );
	},
	useStepNavigation( currentStepSlug, navigate ) {
		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case 'create-site':
					return navigate( 'processing', undefined, true );

				case 'processing': {
					if ( providedDependencies.processingResult !== ProcessingResult.SUCCESS ) {
						// Site creation failed. Stay on the flow so the processing
						// step's error UI surfaces; nothing further we can do here.
						return;
					}

					const { siteId, siteSlug } = providedDependencies;
					if ( ! siteId || ! siteSlug ) {
						return;
					}

					const draft = readAnonDraft();
					const title = draft?.title ?? '';
					const content = draft?.content ?? '';

					try {
						const post = ( await wpcom.req.post(
							`/sites/${ siteId }/posts/new`,
							{ apiVersion: '1.2' },
							{ title, content, status: 'draft' }
						) ) as { ID: number };

						clearAnonDraft();

						recordTracksEvent( 'calypso_write_on_draft_transfer_succeeded', {
							site_id: siteId,
						} );

						window.location.assign(
							`https://${ siteSlug }/wp-admin/admin.php?page=write&post=${ post.ID }`
						);
					} catch ( error ) {
						// Surfacing the failure to the user is handled upstream by
						// the standard new-site flow; fall back to the site's home
						// so they at least land somewhere meaningful with the draft
						// preserved in localStorage for a retry.
						const errorMessage = ( error instanceof Error ? error.message : String( error ) ).slice(
							0,
							200
						);
						recordTracksEvent( 'calypso_write_on_draft_transfer_failed', {
							site_id: siteId,
							error: errorMessage,
						} );
						logToLogstash( {
							feature: 'calypso_client',
							message: 'write-on: failed to transfer anon draft',
							severity: 'error',
							blog_id: siteId,
							properties: {
								type: 'write_on_draft_transfer_failed',
								error: errorMessage,
							},
						} );
						window.location.assign( `/home/${ siteSlug }` );
					}
					return;
				}

				default:
					return;
			}
		};

		return { submit };
	},
};

export default writeOn;
