import { Step } from '@automattic/onboarding';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import {
	getWowFunnelDest,
	getWowFunnelHandoffUrl,
	getWowFunnelSlug,
	isKnownWowFunnel,
	isWowFunnelWaitTimeout,
	logWowFunnelEvent,
	waitForWowFunnelReady,
} from 'calypso/landing/stepper/utils/wow-funnel';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';

/**
 * How many times a customer whose site is slow is offered another wait before the error step.
 */
const MAX_RETRIES = 2;

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
	const siteIdentifier = siteSlug || ( siteId && siteId !== '0' ? siteId : null );

	// Each wait the customer asks for is one attempt. A wait that runs out of time stops here and
	// offers another, rather than sending someone who has just paid to an error page: by then the
	// build is nearly always still finishing, not broken.
	const [ attempt, setAttempt ] = useState( 0 );
	const [ hasTimedOut, setHasTimedOut ] = useState( false );

	// Strict mode mounts effects twice, and this one navigates away; a second run would start a
	// duplicate poll against the same site. Keyed by attempt, so asking again does start one.
	const startedAttemptRef = useRef( -1 );

	useEffect( () => {
		if ( startedAttemptRef.current === attempt ) {
			return;
		}
		startedAttemptRef.current = attempt;

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

				// Resolved only now, so it names the site that exists after the transfer rather
				// than the one this flow started with.
				const handoffUrl = await getWowFunnelHandoffUrl( { dest, siteIdentifier } );

				logWowFunnelEvent( 'handoff_redirect', { funnel: funnelSlug, dest } );
				window.location.replace( handoffUrl );
			} catch ( error ) {
				// Another wait is offered only so many times. A site still not ready after
				// these is not merely slow, and the error step is where support is.
				if ( isWowFunnelWaitTimeout( error ) && attempt < MAX_RETRIES ) {
					setHasTimedOut( true );
					return;
				}

				// waitForWowFunnelReady already reported which outcome this was, and its message
				// is written for the customer.
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
		attempt,
		dest,
		funnelSlug,
		requestedFunnelSlug,
		setSiteSetupError,
		siteIdentifier,
		submit,
	] );

	if ( hasTimedOut ) {
		const tryAgain = () => {
			logWowFunnelEvent( 'handoff_retry', { funnel: funnelSlug, attempt: attempt + 1 } );
			setHasTimedOut( false );
			setAttempt( ( current ) => current + 1 );
		};

		const heading = __( 'Your site is almost ready' );

		return (
			<>
				<DocumentHead title={ heading } />
				<Step.CenteredColumnLayout
					columnWidth={ 6 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ heading }
							subText={ __(
								'Setting it up is taking longer than usual. Your purchase went through, and nothing is lost.'
							) }
						/>
					}
				>
					<HStack justify="center">
						<Button variant="primary" onClick={ tryAgain }>
							{ __( 'Try again' ) }
						</Button>
					</HStack>
				</Step.CenteredColumnLayout>
			</>
		);
	}

	const title = __( 'Getting your site ready…' );

	if ( shouldUseStepContainerV2( flow ) ) {
		return <Step.Loading title={ title } />;
	}

	return <Loading className="wpcom-loading__boot" title={ title } />;
};

export default WowFunnelHandoff;
