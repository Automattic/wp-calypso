import { Step } from '@automattic/onboarding';
import { Button, Notice, __experimentalHStack as HStack } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { useBlueprintTitle } from 'calypso/landing/stepper/hooks/use-blueprint-title';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import {
	clearWowFunnelSite,
	getWowFunnelArgs,
	getWowFunnelEntryQueryArgs,
	getWowFunnelSlug,
	isKnownWowFunnel,
	isSameWowFunnelRun,
	logWowFunnelEvent,
} from 'calypso/landing/stepper/utils/wow-funnel';
import {
	discardPendingWowFunnelSite,
	fetchPendingWowFunnelSite,
} from 'calypso/landing/stepper/utils/wow-funnel-site';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { withLocale } from '../../../helpers/with-locale';
import type { Step as StepType } from '../../types';
import type { PendingWowFunnelSite } from 'calypso/landing/stepper/utils/wow-funnel-site';

/**
 * Asks a customer who enters one funnel run while another's site is still unpaid which one they
 * want.
 *
 * The server allows one unpaid funnel site at a time. Handing that site to a different run would
 * carry on over a site built for something else — its blueprint never imported, say — and tearing
 * it down on entry would let anyone reloading a CTA churn Atomic sites. So it is the customer's
 * call: continue the run that built the site, or discard the site (rate-limited server-side) and
 * start the run they clicked.
 *
 * Reached from flow entry (resumeWowFunnelRun) with the entry URL's query intact, so starting over
 * is just re-entering with it once the site is gone.
 */
const WowFunnelPending: StepType = function WowFunnelPending( { flow } ) {
	const { __ } = useI18n();
	const locale = useFlowLocale();
	const queryParams = useQuery();

	const [ pending, setPending ] = useState< PendingWowFunnelSite | null >( null );
	const [ isDiscarding, setIsDiscarding ] = useState( false );
	const [ notice, setNotice ] = useState< string | null >( null );
	// Once the server refuses a discard for the limit, starting over is off the table this visit.
	const [ canStartOver, setCanStartOver ] = useState( true );

	const funnelSlug = getWowFunnelSlug( queryParams ) ?? '';
	const funnelArgs = getWowFunnelArgs( queryParams );

	// Customers know a run by the blueprint they picked ("Punk"), not by the address of the site it
	// builds on, so name both blueprints when there is one.
	const { title: pendingBlueprintTitle, isLoading: isPendingTitleLoading } = useBlueprintTitle(
		pending?.funnelArgs?.blueprint_slug
	);
	const { title: thisBlueprintTitle, isLoading: isThisTitleLoading } = useBlueprintTitle(
		funnelArgs.blueprint_slug
	);

	const flowEntryUrl = withLocale( `/setup/${ flow }`, locale );
	// Re-entering with this run's own URL: flow entry resumes or starts it as the server now sees fit.
	const thisRunUrl = addQueryArgs( flowEntryUrl, Object.fromEntries( queryParams.entries() ) );

	// Strict mode mounts effects twice; one lookup is enough.
	const hasLookedUpRef = useRef( false );

	useEffect( () => {
		if ( hasLookedUpRef.current ) {
			return;
		}
		hasLookedUpRef.current = true;

		( async () => {
			const site = await fetchPendingWowFunnelSite();

			// Nothing to choose between any more — paid for or reverted since entry, or it is this
			// run's own site after all. Flow entry knows what to do with either.
			if ( ! site || isSameWowFunnelRun( site, funnelSlug, funnelArgs ) ) {
				window.location.replace( thisRunUrl );
				return;
			}

			setPending( site );
		} )();
		// Once per visit, on the URL the customer arrived with.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const continuePendingRun = () => {
		if ( ! pending ) {
			return;
		}

		logWowFunnelEvent( 'pending_choice_continue', {
			funnel: funnelSlug,
			pending_funnel: pending.funnelSlug,
			blog_id: pending.blogId,
		} );
		window.location.assign(
			addQueryArgs(
				flowEntryUrl,
				getWowFunnelEntryQueryArgs( pending.funnelSlug, pending.funnelArgs )
			)
		);
	};

	const startOver = async () => {
		if ( ! pending || isDiscarding ) {
			return;
		}

		setIsDiscarding( true );
		setNotice( null );
		logWowFunnelEvent( 'pending_choice_start_over', {
			funnel: funnelSlug,
			pending_funnel: pending.funnelSlug,
			blog_id: pending.blogId,
		} );

		const result = await discardPendingWowFunnelSite( pending.blogId );

		if ( 'discarded' === result || 'gone' === result ) {
			// This tab's memory of the old run must not hand its site back to the new one.
			clearWowFunnelSite();
			window.location.assign( thisRunUrl );
			return;
		}

		setIsDiscarding( false );

		switch ( result ) {
			case 'rate_limited':
				setCanStartOver( false );
				setNotice(
					__(
						"You've started over a few times recently, so you can't start another site right now. You can carry on with your unfinished site, or try again later."
					)
				);
				return;
			case 'not_ready':
				setNotice( __( 'Your unfinished site is still being set up. Try again in a moment.' ) );
				return;
			case 'unavailable':
				setCanStartOver( false );
				setNotice(
					__(
						"Starting over isn't available right now. You can carry on with your unfinished site."
					)
				);
				return;
			default:
				setNotice( __( "We couldn't start over just now. Please try again." ) );
		}
	};

	// Held until the blueprint names are known too, so the copy never flashes a fallback first.
	if ( ! pending || isPendingTitleLoading || isThisTitleLoading ) {
		const loadingTitle = __( 'Checking your sites…' );
		if ( shouldUseStepContainerV2( flow ) ) {
			return <Step.Loading title={ loadingTitle } />;
		}
		return <Loading className="wpcom-loading__boot" title={ loadingTitle } />;
	}

	// Continue re-enters the pending run from its own entry URL, so offer it only when this client
	// can: a funnel it does not know would fall back to plain onboarding (abandoning the site), and a
	// run whose args the entry URL cannot carry would compute a different run and land back here.
	const canContinue =
		isKnownWowFunnel( pending.funnelSlug ) &&
		isSameWowFunnelRun(
			pending,
			pending.funnelSlug,
			getWowFunnelArgs(
				new URLSearchParams( getWowFunnelEntryQueryArgs( pending.funnelSlug, pending.funnelArgs ) )
			)
		);

	const heading = __( 'You have an unfinished site' );

	// What they started: the blueprint when the run had one, else the site's address (a plain
	// funnel run has no blueprint to name). Site slugs use `::` for subdirectory sites.
	const startedSentence = pendingBlueprintTitle
		? sprintf(
				/* translators: %s is the name of a site blueprint the customer picked, e.g. "Punk" */
				__( 'You started setting up the %s blueprint but didn’t finish.' ),
				pendingBlueprintTitle
			)
		: sprintf(
				/* translators: %s is the address of the customer's unfinished site, e.g. example.wordpress.com */
				__( 'You started setting up %s but didn’t finish.' ),
				pending.siteSlug.replace( /::/g, '/' )
			);

	let choiceSentence: string;
	if ( canContinue ) {
		choiceSentence = thisBlueprintTitle
			? sprintf(
					/* translators: %s is the name of the site blueprint the customer just picked, e.g. "Annalee" */
					__( 'Carry on with it, or discard it and start the %s blueprint instead.' ),
					thisBlueprintTitle
				)
			: __( 'Carry on with it, or discard it and start this one instead.' );
	} else {
		choiceSentence = thisBlueprintTitle
			? sprintf(
					/* translators: %s is the name of the site blueprint the customer just picked, e.g. "Annalee" */
					__( 'It can’t be continued from here. Discard it to start the %s blueprint instead.' ),
					thisBlueprintTitle
				)
			: __( 'It can’t be continued from here. Discard it to start this one instead.' );
	}

	const subText = `${ startedSentence } ${ choiceSentence }`;

	return (
		<>
			<DocumentHead title={ heading } />
			<Step.CenteredColumnLayout
				columnWidth={ 6 }
				topBar={ <Step.TopBar /> }
				heading={ <Step.Heading text={ heading } subText={ subText } /> }
			>
				{ notice && (
					<Notice status="warning" isDismissible={ false }>
						{ notice }
					</Notice>
				) }
				<HStack justify="center" spacing={ 4 }>
					{ canContinue && (
						<Button variant="primary" onClick={ continuePendingRun } disabled={ isDiscarding }>
							{ __( 'Continue that site' ) }
						</Button>
					) }
					{ canStartOver && (
						<Button
							variant="secondary"
							onClick={ startOver }
							isBusy={ isDiscarding }
							disabled={ isDiscarding }
						>
							{ __( 'Discard it and start over' ) }
						</Button>
					) }
				</HStack>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default WowFunnelPending;
