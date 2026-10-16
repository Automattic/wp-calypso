import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { Card } from '../../components/card';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import NewTabLabel from '../components/new-tab-label';
import callArt from './images/welcome/call.svg';
import referralsArt from './images/welcome/referrals.svg';
import wooPaymentsArt from './images/welcome/woopayments.svg';
import type { AgencyTierType, RecordTracksEvent } from '../tiers/types';
import type { AgencyApprovalStatus } from '@automattic/api-core';
import type { ReactNode } from 'react';

import './welcome-band.scss';

export const WELCOME_BAND_DISMISSED_PREFERENCE = 'a4a-overview-welcome-band-dismissed';

// How long an agency at the first tier counts as new.
const NEW_AGENCY_WINDOW_MS = 60 * 24 * 60 * 60 * 1000;

/**
 * Who sees the band on Overview, until they close it: agencies under review, and agencies at
 * the first tier that joined in the last 60 days. A rejected application gets its own card.
 * While `isLoading`, the band may still show, so Overview holds back the Pending card instead
 * of swapping it for the band.
 */
export function useWelcomeBandVisibility(
	approvalStatus?: AgencyApprovalStatus | '',
	tierId?: AgencyTierType,
	createdAt?: string
) {
	const isNewAgency =
		!! createdAt && new Date( createdAt ).getTime() >= Date.now() - NEW_AGENCY_WINDOW_MS;
	const isEligible =
		approvalStatus !== 'rejected' &&
		( approvalStatus === 'pending' || ( tierId === 'emerging-partner' && isNewAgency ) );
	const { data: isDismissed, isFetched } = useQuery( {
		...userPreferenceQuery( WELCOME_BAND_DISMISSED_PREFERENCE ),
		enabled: isEligible,
	} );

	return {
		isVisible: isEligible && isFetched && ! isDismissed,
		isLoading: isEligible && ! isFetched,
	};
}

type StepId = 'call' | 'referrals' | 'woopayments';

// The muted grey that still reads on the blue field; the components' muted grey is under AA there.
const MUTED_ON_FIELD = 'var( --a4a-welcome-band-muted )';

interface WelcomeBandProps {
	/** Under review, referring and WooPayments unlock on activation. */
	isPending: boolean;
	referralsHref: string;
	wooPaymentsHref: string;
	onScheduleCall: () => void;
	isSchedulingCall?: boolean;
	onTakeTour: () => void;
	recordTracksEvent: RecordTracksEvent;
}

/**
 * Greets new agencies on Overview with three first steps and the full tour one click
 * away. Overview shows it per `useWelcomeBandVisibility`; closing it hides it for good.
 */
export default function WelcomeBand( {
	isPending,
	referralsHref,
	wooPaymentsHref,
	onScheduleCall,
	isSchedulingCall,
	onTakeTour,
	recordTracksEvent,
}: WelcomeBandProps ) {
	const { mutate: saveDismissed } = useMutation(
		userPreferenceOptimisticMutation( WELCOME_BAND_DISMISSED_PREFERENCE )
	);
	const state = isPending ? 'under-review' : 'approved';

	const hasRecordedView = useRef( false );
	useEffect( () => {
		if ( ! hasRecordedView.current ) {
			hasRecordedView.current = true;
			recordTracksEvent( 'calypso_a4a_overview_welcome_band_view', { state } );
		}
	}, [ state, recordTracksEvent ] );

	const recordStep = ( step: StepId ) =>
		recordTracksEvent( 'calypso_a4a_overview_welcome_band_step_click', { state, step } );

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
			description: __(
				'A free 30-minute call to identify your business challenges and ways to grow your agency.'
			),
			action: (
				<Button
					variant="primary"
					size="compact"
					isBusy={ isSchedulingCall }
					disabled={ isSchedulingCall }
					onClick={ () => {
						recordStep( 'call' );
						onScheduleCall();
					} }
				>
					<span className="a4a-welcome-band-cta-label">
						<NewTabLabel justify="flex-start">{ __( 'Book your free advisor call' ) }</NewTabLabel>
					</span>
				</Button>
			),
		},
		{
			id: 'referrals',
			art: referralsArt,
			isLocked: isPending,
			title: __( 'Earn commission on referrals' ),
			description: __( 'Generate passive income when your clients purchase hosting and products.' ),
			action: (
				<RouterLinkButton
					to={ referralsHref }
					variant="secondary"
					size="compact"
					onClick={ () => recordStep( 'referrals' ) }
				>
					<span className="a4a-welcome-band-cta-label">{ __( 'Explore referrals' ) }</span>
				</RouterLinkButton>
			),
		},
		{
			id: 'woopayments',
			art: wooPaymentsArt,
			isLocked: isPending,
			title: __( 'Enjoy revenue share with WooPayments' ),
			description: __(
				'Enable WooPayments on your client sites and earn revenue on the payment volume.'
			),
			action: (
				<RouterLinkButton
					to={ wooPaymentsHref }
					variant="secondary"
					size="compact"
					onClick={ () => recordStep( 'woopayments' ) }
				>
					<span className="a4a-welcome-band-cta-label">{ __( 'Set up WooPayments' ) }</span>
				</RouterLinkButton>
			),
		},
	];

	return (
		<Card>
			<section className="a4a-welcome-band-layout" aria-label={ __( 'Welcome' ) }>
				<div className="a4a-welcome-band-close">
					<Button
						icon={ close }
						size="small"
						label={ __( 'Close' ) }
						onClick={ () => {
							recordTracksEvent( 'calypso_a4a_overview_welcome_band_dismiss_click', { state } );
							saveDismissed( true );
						} }
					/>
				</div>
				<div className="a4a-welcome-band-grid">
					<div className="a4a-welcome-band-intro">
						<VStack spacing={ 2 }>
							<Heading level={ 2 } size={ 20 } weight={ 500 } lineHeight="28px">
								{ isPending
									? __( 'Welcome to Automattic for Agencies' )
									: __( 'Your account is ready' ) }
							</Heading>
							{ isPending && (
								<Text variant="muted" lineHeight="20px">
									{ __(
										'We’re reviewing your account, and you can book your advisor call now. Most are activated within one business day.'
									) }
								</Text>
							) }
							<Text lineHeight="20px">
								{ createInterpolateElement(
									__( 'Start with these three steps, or <tour>take the full tour</tour>.' ),
									{
										tour: (
											<Button
												variant="link"
												onClick={ () => {
													recordTracksEvent( 'calypso_a4a_overview_welcome_band_full_tour_click', {
														state,
													} );
													onTakeTour();
												} }
											/>
										),
									}
								) }
							</Text>
						</VStack>
					</div>
					<ol className="a4a-welcome-band-steps">
						{ steps.map( ( step, index ) => (
							<li
								key={ step.id }
								className={ clsx( 'a4a-welcome-band-step', { 'is-locked': step.isLocked } ) }
							>
								<img className="a4a-welcome-band-art" src={ step.art } alt="" />
								<span className="a4a-welcome-band-number" aria-hidden="true">
									{ index + 1 }
								</span>
								<div className="a4a-welcome-band-text">
									<VStack spacing={ 0.5 }>
										<Heading level={ 3 } size={ 13 } weight={ 600 } lineHeight="18px">
											{ step.title }
										</Heading>
										<Text size={ 13 } lineHeight="18px" color={ MUTED_ON_FIELD }>
											{ step.description }
										</Text>
									</VStack>
								</div>
								<div className="a4a-welcome-band-action">
									{ step.isLocked ? (
										<Text size={ 12 } lineHeight="16px" color={ MUTED_ON_FIELD }>
											{ __( 'Unlocks when your account is activated' ) }
										</Text>
									) : (
										<HStack justify="flex-start">{ step.action }</HStack>
									) }
								</div>
							</li>
						) ) }
					</ol>
				</div>
			</section>
		</Card>
	);
}
