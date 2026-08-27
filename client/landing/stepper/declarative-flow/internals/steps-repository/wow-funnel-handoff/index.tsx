import { Step } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import Loading from 'calypso/components/loading';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	getWowFunnelDest,
	getWowFunnelHandoffUrl,
	getWowFunnelSlug,
	isKnownWowFunnel,
	logWowFunnelEvent,
	runWowFunnelAfterReady,
	waitForWowFunnelReady,
} from 'calypso/landing/stepper/utils/wow-funnel';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';

/**
 * The last hop of a WoW funnel: hold the customer on the loading screen until the build they
 * paid for is actually ready, then hand them to it.
 *
 * The funnel used to point checkout's `redirect_to` straight at the built site, skipping the
 * post-checkout hop entirely. That works right up until checkout finishes before the
 * Simple->Atomic switcheroo does, at which point the customer lands in the editor of the
 * pre-switcheroo Simple site. The site is fine and finishes seconds later — but their first
 * look at what they just bought is the wrong site.
 *
 * This page is that missing hop. It exists so the wait happens AFTER payment: the whole point of
 * a funnel is that the build overlaps the customer's own time in the flow, so blocking them
 * before checkout would trade one bad experience for a worse one.
 *
 * Reached by URL from checkout, so everything it needs comes from query params rather than flow
 * state, which does not survive the trip through checkout.
 */
const WowFunnelHandoff: StepType = function WowFunnelHandoff( { navigation, flow } ) {
	const { __ } = useI18n();
	const queryParams = useQuery();
	const { submit } = navigation;
	const { setSiteSetupError } = useDispatch( SITE_STORE );

	const requestedFunnelSlug = getWowFunnelSlug( queryParams );
	const funnelSlug = isKnownWowFunnel( requestedFunnelSlug ) ? requestedFunnelSlug : null;
	const dest = getWowFunnelDest( queryParams, funnelSlug );
	const siteSlug = queryParams.get( 'siteSlug' );
	const siteId = queryParams.get( 'siteId' );
	// Input for the funnel's post-ready work, carried here because flow state does not survive
	// the page loads between checkout, an interstitial and this step.
	const specId = queryParams.get( 'spec_id' );
	const blueprintSlug = queryParams.get( 'blueprint_slug' );
	const siteIdentifier = siteSlug || ( siteId && siteId !== '0' ? siteId : null );

	// Strict mode mounts effects twice, and this one navigates away; a second run would start a
	// duplicate poll against the same site.
	const hasStartedRef = useRef( false );

	useEffect( () => {
		if ( hasStartedRef.current ) {
			return;
		}
		hasStartedRef.current = true;

		const failToErrorStep = ( code: string, message: string ) => {
			setSiteSetupError( code, message );
			submit?.( { hasError: true } );
		};

		// Neither of these should be reachable — the flow only sends registered funnels here, and
		// always with a site — but this page is URL-addressable, so it cannot assume that.
		if ( ! funnelSlug || ! siteIdentifier ) {
			logWowFunnelEvent( 'handoff_missing_context', {
				funnel: requestedFunnelSlug,
				has_site: !! siteIdentifier,
			} );
			failToErrorStep(
				'wow_funnel_handoff_context',
				__( 'Something went wrong while setting up your site.' )
			);
			return;
		}

		( async () => {
			try {
				await waitForWowFunnelReady( { funnelSlug, siteIdentifier } );

				// Whatever the funnel does between "ready" and "handed over" — for the blueprint
				// funnel, writing the confirmed spec onto the imported site. Ordering is the
				// point: the archive restore replaces the site's options wholesale, so this can
				// only run once the wait above says the import is done.
				const { startWalkthrough } = await runWowFunnelAfterReady( {
					funnelSlug,
					siteIdentifier,
					specId,
					blueprintSlug,
				} );

				// Resolved only now, so it names the site that exists after the transfer rather
				// than the one this flow started with.
				const handoffUrl = await getWowFunnelHandoffUrl( {
					dest,
					siteIdentifier,
					startWalkthrough,
				} );

				logWowFunnelEvent( 'handoff_redirect', { funnel: funnelSlug, dest } );
				window.location.replace( handoffUrl );
			} catch ( error ) {
				// waitForWowFunnelReady already reported which outcome this was, and its message
				// is written for the customer — a timeout reads as "taking longer than expected"
				// rather than as a failure.
				failToErrorStep(
					'wow_funnel_handoff',
					error instanceof Error
						? error.message
						: __( 'Something went wrong while setting up your site.' )
				);
			}
		} )();
	}, [
		__,
		blueprintSlug,
		dest,
		funnelSlug,
		requestedFunnelSlug,
		setSiteSetupError,
		siteIdentifier,
		specId,
		submit,
	] );

	const title = __( 'Getting your site ready…' );

	if ( shouldUseStepContainerV2( flow ) ) {
		return <Step.Loading title={ title } />;
	}

	return <Loading className="wpcom-loading__boot" title={ title } />;
};

export default WowFunnelHandoff;
