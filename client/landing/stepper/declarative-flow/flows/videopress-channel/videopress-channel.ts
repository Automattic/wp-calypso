import config from '@automattic/calypso-config';
import { Onboard, OnboardActions } from '@automattic/data-stores';
import { VIDEOPRESS_CHANNEL_FLOW } from '@automattic/onboarding';
import { dispatch, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useCreateSite } from '../../../hooks/use-create-site-hook';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { useFlowState } from '../../internals/state-manager/store';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';

/**
 * The channel theme. A channel is an ordinary `*.wordpress.com` site running this theme; the wpcom
 * side of the `videopress-channel` site-creation flow gives it the Home / Videos / Playlists / About
 * pages the theme links to.
 */
export const VIDEOPRESS_CHANNEL_THEME = 'pub/videopress-channel';

/**
 * Where the flow lands the new channel owner: the VideoPress dashboard of their site, ready for the
 * first upload. The flow ends here on purpose — no Launchpad for the PoC.
 */
export function getChannelDashboardUrl( siteSlug: string ) {
	return `https://${ siteSlug }/wp-admin/admin.php?page=jetpack-videopress`;
}

function initialize() {
	// The PoC is gated: without the flag there is nothing to land users on, so fall back to the
	// standard onboarding flow.
	if ( ! config.isEnabled( 'videopress/channel-flow' ) ) {
		recordTracksEvent( 'calypso_videopress_channel_flow_blocked', { reason: 'flag_off' } );
		window.location.replace( '/setup/onboarding' );
		return [];
	}

	const { setIntent } = dispatch( ONBOARD_STORE ) as OnboardActions;
	setIntent( Onboard.SiteIntent.VideoPressChannel );

	// Everything is login-gated: videopress.com's "Create your channel" button lands logged-out
	// visitors on the WordPress.com signup/login step first.
	return stepsWithRequiredLogin( [
		STEPS.VIDEOPRESS_CHANNEL_SETUP,
		STEPS.PROCESSING,
		STEPS.ERROR,
	] );
}

const videoPressChannel: FlowV2< typeof initialize > = {
	name: VIDEOPRESS_CHANNEL_FLOW,
	get title() {
		return translate( 'Create your channel' );
	},
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	__experimentalUseSessions: true,
	initialize,
	useStepNavigation( _currentStep, navigate ) {
		const { get, set } = useFlowState();
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const createSite = useCreateSite();

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case 'channelSetup':
					set( 'channelSetup', providedDependencies );
					setPendingAction( () =>
						createSite( {
							theme: VIDEOPRESS_CHANNEL_THEME,
							siteIntent: Onboard.SiteIntent.VideoPressChannel,
							siteTitle: providedDependencies.siteTitle,
						} )
					);
					return navigate( 'processing', undefined, true );

				case 'processing': {
					const site = get( 'site' );

					if ( providedDependencies?.processingResult !== ProcessingResult.SUCCESS || ! site ) {
						// Site creation failed: the processing step already shows its error UI.
						return;
					}

					recordTracksEvent( 'calypso_videopress_channel_created', {
						site_id: site.siteId,
					} );

					return window.location.assign( getChannelDashboardUrl( site.siteSlug ) );
				}
			}
		};

		return { submit };
	},
};

export default videoPressChannel;
