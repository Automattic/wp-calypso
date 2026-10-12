import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalHeading as Heading, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Card } from '../../components/card';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import NewTabLabel from '../overview/new-tab-label';
import callArt from './images/welcome/call.svg';
import productArt from './images/welcome/product.svg';
import siteArt from './images/welcome/site.svg';
import type { RecordTracksEvent } from '../tiers/types';
import type { ReactNode } from 'react';

import './welcome-band.scss';

// Closing the band is remembered on the account, so it stays gone on later visits.
export const DISMISSED_PREFERENCE = 'a4a-overview-welcome-band-dismissed';

type StepId = 'call' | 'site' | 'product';

interface WelcomeBandProps {
	/** Under review, buying and referring unlock on activation. */
	isPending: boolean;
	sitesHref: string;
	marketplaceHref: string;
	onScheduleCall: () => void;
	isSchedulingCall?: boolean;
	onTakeTour: () => void;
	recordTracksEvent: RecordTracksEvent;
}

/**
 * The welcome on Overview: three first steps drawn from the dashboard's own screens,
 * with the full tour one click away. Closing it removes it for good.
 */
export default function WelcomeBand( {
	isPending,
	sitesHref,
	marketplaceHref,
	onScheduleCall,
	isSchedulingCall,
	onTakeTour,
	recordTracksEvent,
}: WelcomeBandProps ) {
	const { data: savedDismissed, isFetched } = useQuery(
		userPreferenceQuery( DISMISSED_PREFERENCE )
	);
	const { mutate: saveDismissed } = useMutation(
		userPreferenceOptimisticMutation( DISMISSED_PREFERENCE )
	);
	const state = isPending ? 'under-review' : 'approved';
	const headline = isPending
		? __( 'Welcome to Automattic for Agencies' )
		: __( 'Your account is ready' );

	// Closing collapses the band from its own height to nothing, so the page below moves once.
	const shellRef = useRef< HTMLElement >( null );
	const [ closingHeight, setClosingHeight ] = useState< number | null >( null );
	const [ isClosed, setIsClosed ] = useState( false );

	const hasRecordedView = useRef( false );
	useEffect( () => {
		if ( ! isFetched || hasRecordedView.current ) {
			return;
		}
		hasRecordedView.current = true;
		if ( savedDismissed ) {
			return;
		}
		recordTracksEvent( 'calypso_a4a_overview_welcome_band_view', { state } );
	}, [ isFetched, savedDismissed, state, recordTracksEvent ] );

	// Wait for the preference, so a closed band never flashes open first.
	if ( ! isFetched || savedDismissed || isClosed ) {
		return null;
	}

	const dismiss = () => {
		recordTracksEvent( 'calypso_a4a_overview_welcome_band_dismiss_click', { state } );
		saveDismissed( true );
		const shell = shellRef.current;
		if ( ! shell || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
			setIsClosed( true );
			return;
		}
		setClosingHeight( shell.offsetHeight );
		// Two frames: the first pins the current height, the second animates it to zero.
		requestAnimationFrame( () => requestAnimationFrame( () => setClosingHeight( 0 ) ) );
	};

	const takeTour = () => {
		recordTracksEvent( 'calypso_a4a_overview_welcome_band_full_tour_click', { state } );
		onTakeTour();
	};

	const recordStep = ( step: StepId ) =>
		recordTracksEvent( 'calypso_a4a_overview_welcome_band_step_click', { state, step } );

	// Each step leads with what the agency gets, in the words of today's tour (sections.tsx),
	// and the action is the link under it.
	const steps: {
		id: StepId;
		art: string;
		title: string;
		description: string;
		action: ReactNode;
		isLocked?: boolean;
	}[] = [
		{
			id: 'call',
			art: callArt,
			title: __( 'Plan your growth with an advisor' ),
			description: __( 'A free 30-minute call about your goals and new ways to win clients.' ),
			action: (
				<Button
					variant="primary"
					size="compact"
					className="welcome-band-cta"
					isBusy={ isSchedulingCall }
					onClick={ () => {
						recordStep( 'call' );
						onScheduleCall();
					} }
				>
					<NewTabLabel justify="flex-start">{ __( 'Book your free advisor call' ) }</NewTabLabel>
				</Button>
			),
		},
		{
			id: 'site',
			art: siteArt,
			title: __( 'Manage every site in one place' ),
			description: __( 'Wherever they’re hosted. Our plugin connects a site in seconds.' ),
			action: (
				<RouterLinkButton
					to={ sitesHref }
					variant="secondary"
					size="compact"
					className="welcome-band-cta"
					onClick={ () => recordStep( 'site' ) }
				>
					{ __( 'Connect your first site' ) }
				</RouterLinkButton>
			),
		},
		{
			id: 'product',
			art: productArt,
			isLocked: isPending,
			title: __( 'Earn on every plugin and plan' ),
			description: __( 'Buy at agency prices, or let your client pay and earn on each renewal.' ),
			action: (
				<RouterLinkButton
					to={ marketplaceHref }
					variant="secondary"
					size="compact"
					className="welcome-band-cta"
					onClick={ () => recordStep( 'product' ) }
				>
					{ __( 'Explore products & hosting' ) }
				</RouterLinkButton>
			),
		},
	];

	return (
		<Card
			ref={ shellRef }
			className={ clsx( 'welcome-band-shell', closingHeight !== null && 'is-closing' ) }
			style={ closingHeight !== null ? { height: closingHeight } : undefined }
			onTransitionEnd={ ( event: React.TransitionEvent ) => {
				if ( event.target === event.currentTarget && closingHeight === 0 ) {
					setIsClosed( true );
				}
			} }
		>
			<section className="welcome-band" aria-label={ __( 'Welcome' ) }>
				<div className="welcome-band-intro">
					<div className="welcome-band-intro-text">
						<Heading level={ 2 } className="welcome-band-title">
							{ headline }
						</Heading>
						{ isPending && (
							<Text variant="muted" size={ 13 } lineHeight="18px">
								{ __(
									'We’re reviewing your account, and you can book your advisor call now. Most are activated within one business day.'
								) }
							</Text>
						) }
						<Text size={ 13 } lineHeight="18px">
							{ createInterpolateElement(
								__( 'Start with these three steps, or <tour>take the full tour</tour>.' ),
								{ tour: <Button variant="link" onClick={ takeTour } /> }
							) }
						</Text>
					</div>
					<div className="welcome-band-intro-actions">
						<Button
							className="welcome-band-close"
							icon={ close }
							size="small"
							label={ __( 'Close' ) }
							onClick={ dismiss }
						/>
					</div>
				</div>
				<ol className="welcome-band-field">
					{ steps.map( ( step, index ) => (
						<li
							key={ step.id }
							className={ clsx( 'welcome-band-step', step.isLocked && 'is-locked' ) }
						>
							<img className="welcome-band-art" src={ step.art } alt="" />
							<div className="welcome-band-caption">
								<span className="welcome-band-pin" aria-hidden="true">
									<span>{ index + 1 }</span>
								</span>
								<span className="welcome-band-caption-text">
									<Heading level={ 3 } className="welcome-band-step-title">
										{ step.title }
									</Heading>
									<Text
										variant="muted"
										size={ 13 }
										lineHeight="18px"
										className="welcome-band-muted"
									>
										{ step.description }
									</Text>
									{ step.isLocked ? (
										<Text
											variant="muted"
											size={ 12 }
											lineHeight="16px"
											className="welcome-band-action welcome-band-muted"
										>
											{ __( 'Unlocks when your account is activated' ) }
										</Text>
									) : (
										<span className="welcome-band-action">{ step.action }</span>
									) }
								</span>
							</div>
						</li>
					) ) }
				</ol>
			</section>
		</Card>
	);
}
