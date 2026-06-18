import { OnboardActions } from '@automattic/data-stores';
import { WRITE_ON_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { type FlowV2, type SubmitHandler } from '../../internals/types';

export const ANON_DRAFT_STORAGE_KEY = 'wpcom-write-anon-draft';

type AnonDraft = {
	title?: string;
	content?: string;
	ts?: number;
};

function readAnonDraft(): AnonDraft | null {
	try {
		const raw = window.localStorage.getItem( ANON_DRAFT_STORAGE_KEY );
		if ( ! raw ) {
			return null;
		}
		const parsed = JSON.parse( raw );
		if ( parsed && typeof parsed === 'object' ) {
			return parsed as AnonDraft;
		}
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

		// Runs only on flow entry (before any step is selected). The flow re-reads
		// localStorage at publish time, so a refresh mid-signup still finds the
		// draft.
		useEffect( () => {
			if ( currentStepSlug ) {
				return;
			}

			// Phase 1 is a logged-out fake door. If the visitor is already
			// authenticated they should not be here — send them to the standard
			// onboarding flow.
			if ( isLoggedIn ) {
				window.location.replace( '/setup/onboarding' );
				return;
			}

			const draft = readAnonDraft();
			if ( ! draft ) {
				window.location.replace( '/setup/onboarding' );
				return;
			}

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

					const siteId = providedDependencies.siteId as number | undefined;
					const siteSlug = providedDependencies.siteSlug as string | undefined;
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

						window.location.assign(
							`https://${ siteSlug }/wp-admin/admin.php?page=write&post=${ post.ID }`
						);
					} catch ( error ) {
						// Surfacing the failure to the user is handled upstream by
						// the standard new-site flow; fall back to the site's home
						// so they at least land somewhere meaningful with the draft
						// preserved in localStorage for a retry.
						// eslint-disable-next-line no-console
						console.error( 'write-on: failed to transfer anon draft', error );
						window.location.assign( `/home/${ siteSlug }` );
					}
					return;
				}

				default:
					return;
			}
		};

		const goBack = () => {
			window.history.back();
		};

		return { submit, goBack };
	},
};

export default writeOn;
