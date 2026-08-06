import { WRITE_NEW_SITE_FLOW } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useQuery } from '../../../hooks/use-query';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { type FlowV2, type SubmitHandler } from '../../internals/types';

function initialize() {
	return stepsWithRequiredLogin( [ STEPS.SITE_CREATION_STEP, STEPS.PROCESSING ] );
}

const writeNewSite: FlowV2< typeof initialize > = {
	name: WRITE_NEW_SITE_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepNavigation( _currentStepSlug, navigate ) {
		// The picker links here with a `source` (e.g. `?source=write-editor`). Stepper
		// preserves the query string across steps, so it is still present here. Forward
		// it into the Write editor, which reads `source` for its back button and Tracks.
		const source = useQuery().get( 'source' );

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
					if ( ! siteSlug ) {
						return;
					}

					recordTracksEvent( 'calypso_write_new_site_flow_site_created', {
						site_id: siteId,
						source,
					} );

					const params = new URLSearchParams( { page: 'write' } );
					if ( source ) {
						params.set( 'source', source );
					}
					window.location.assign(
						`https://${ siteSlug }/wp-admin/admin.php?${ params.toString() }`
					);
					return;
				}

				default:
					return;
			}
		};

		return { submit };
	},
};

export default writeNewSite;
