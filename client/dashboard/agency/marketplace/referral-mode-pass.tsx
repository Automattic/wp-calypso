import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Notice } from '../../components/notice';
import stepHosting from './images/referral/step-1-add-hosting.svg';
import stepProduct from './images/referral/step-1-add.svg';
import stepRequest from './images/referral/step-2-send.svg';
import stepReferralsHosting from './images/referral/step-3-earn-hosting.svg';
import stepReferrals from './images/referral/step-3-earn.svg';
import type { ReactNode } from 'react';

import './referral-mode-pass.scss';

// Referral mode treatments, `?referral=`:
//   g   Main today: “Refer products” toggle, info icon, five-slide guide on the first switch.
//   h   the toggle reads “Refer to clients”, no info icon, no guide on the switch,
//       and a notice that can't be dismissed while referral mode is on.
//   hb  (default) H with the earning shown before the switch (a chip beside the toggle) and,
//       once on, a band: what you earn, and the three steps as SVGs exported from
//       Figma “Marketplace Graphics” › Referral / product, request, referrals (the
//       Featured drawings' grammar) on the blue field. No guide: the band
//       is the walkthrough. “Got it” folds
//       it to a one-line bar that stays while referral mode is on.
// The choice sticks for the session so Hosting and Products agree.
const STORAGE_KEY = 'a4a-referral-treatment';
// “Got it” is remembered on the account, so the band opens folded on every page and visit.
const BAND_FOLDED_PREFERENCE = 'a4a-marketplace-referral-band-folded';
// The band's ground, `?field=`: n flat light blue (default), o flat neutral grey,
// p the blurred blue field at 35%. Figma › Referral steps v2.
function fieldTreatment(): 'n' | 'o' | 'p' {
	const param = new URLSearchParams( window.location.search ).get( 'field' );
	try {
		if ( param === 'n' || param === 'o' || param === 'p' ) {
			window.sessionStorage.setItem( 'a4a-referral-field', param );
		}
		const stored = window.sessionStorage.getItem( 'a4a-referral-field' );
		return stored === 'o' || stored === 'p' ? stored : 'n';
	} catch {
		return param === 'o' || param === 'p' ? param : 'n';
	}
}
const REFERRALS_HELP_URL =
	'https://agencieshelp.automattic.com/knowledge-base/referring-products-to-clients/';

export type ReferralTreatment = 'g' | 'h' | 'hb';

export function referralTreatment(): ReferralTreatment {
	const param = new URLSearchParams( window.location.search ).get( 'referral' );
	const valid = ( value: string | null ): value is ReferralTreatment =>
		value === 'g' || value === 'h' || value === 'hb';
	try {
		if ( valid( param ) ) {
			window.sessionStorage.setItem( STORAGE_KEY, param );
		}
		const stored = window.sessionStorage.getItem( STORAGE_KEY );
		return valid( stored ) ? stored : 'hb';
	} catch {
		return valid( param ) ? param : 'hb';
	}
}

export function ReferralModeNotice( {
	children,
	onLearnMore,
}: {
	children: ReactNode;
	onLearnMore: () => void;
} ) {
	return (
		<Notice
			variant="info"
			title={ __( 'You’re referring to clients' ) }
			actions={
				<Button variant="link" onClick={ onLearnMore }>
					{ __( 'How referring works' ) }
				</Button>
			}
		>
			{ children }
		</Notice>
	);
}

export function ReferralEarnPill( { children }: { children: ReactNode } ) {
	return <span className="referral-chip is-soft">{ children }</span>;
}

type BandProps = {
	headline: string;
	summary: string;
	/** Which page the band sits on: its first and last drawings show that page's item. */
	kind?: 'products' | 'hosting';
};

// The reveal plays only when the agency switches referral mode on, never when a
// page opens with the mode already on (moving between Hosting and Products).
let revealPending = false;
export function markReferralReveal() {
	revealPending = true;
}

export function ReferralModeBand( { headline, summary, kind = 'products' }: BandProps ) {
	const isHosting = kind === 'hosting';
	const { data: savedFolded, isFetched } = useQuery(
		userPreferenceQuery( BAND_FOLDED_PREFERENCE )
	);
	const { mutate: saveFolded } = useMutation( userPreferenceMutation( BAND_FOLDED_PREFERENCE ) );
	// Until the account says otherwise, follow it; a click this visit takes over.
	const [ choice, setChoice ] = useState< 'band' | 'bar' | null >( null );
	const view = choice ?? ( savedFolded ? 'bar' : 'band' );
	// Motion only answers an action on this page: switching the mode on, “Got it”,
	// or “How it works”. A page that opens with the mode on just shows it.
	const [ isRevealing ] = useState( () => {
		const pending = revealPending;
		revealPending = false;
		return pending;
	} );
	const [ isOpened, setIsOpened ] = useState( ! isRevealing );
	const isAnimated = isRevealing || choice !== null;

	// One box, two layers: its height moves between the band's and the bar's
	// natural heights while the layers crossfade, so the page below moves once.
	const bandRef = useRef< HTMLElement >( null );
	const barRef = useRef< HTMLDivElement >( null );
	const [ heights, setHeights ] = useState< { band: number; bar: number } | null >( null );
	useLayoutEffect( () => {
		const band = bandRef.current;
		const bar = barRef.current;
		if ( ! band || ! bar ) {
			return;
		}
		const measure = () => setHeights( { band: band.offsetHeight, bar: bar.offsetHeight } );
		measure();
		const observer = new ResizeObserver( measure );
		observer.observe( band );
		observer.observe( bar );
		return () => observer.disconnect();
	}, [ isFetched ] );

	// The reveal starts from a closed box that has painted once.
	useEffect( () => {
		if ( isOpened || ! heights ) {
			return;
		}
		const frame = window.requestAnimationFrame( () => setIsOpened( true ) );
		return () => window.cancelAnimationFrame( frame );
	}, [ isOpened, heights ] );

	// Wait for the preference, so a folded band never flashes open first.
	if ( ! isFetched ) {
		return null;
	}

	let height: number | undefined;
	if ( ! isOpened ) {
		height = 0;
	} else if ( heights ) {
		height = view === 'band' ? heights.band : heights.bar;
	}

	return (
		<div
			className={ clsx(
				'referral-shell',
				`is-${ view }`,
				isAnimated && 'is-animated',
				! isOpened && 'is-closed'
			) }
			style={ { height } }
		>
			<section
				ref={ bandRef }
				className="referral-band"
				aria-label={ __( 'Referral mode' ) }
				inert={ view !== 'band' }
			>
				<div className="referral-band-intro">
					<span className="referral-band-eyebrow">
						<span className="referral-dot" aria-hidden="true" />
						{ __( 'Referral mode is on' ) }
					</span>
					<Heading level={ 2 } className="referral-band-title">
						{ headline }
					</Heading>
					<HStack spacing={ 4 } justify="flex-start" expanded={ false }>
						<Button
							variant="secondary"
							size="compact"
							onClick={ () => {
								saveFolded( true );
								setChoice( 'bar' );
							} }
						>
							{ __( 'Got it' ) }
						</Button>
						<ExternalLink href={ REFERRALS_HELP_URL }>{ __( 'Learn more' ) }</ExternalLink>
					</HStack>
				</div>
				<div className={ clsx( 'referral-band-field', `is-${ fieldTreatment() }` ) }>
					<span className="referral-light is-light" aria-hidden="true" />
					<span className="referral-light is-medium" aria-hidden="true" />
					<span className="referral-light is-dark" aria-hidden="true" />
					<span className="referral-light is-centre" aria-hidden="true" />
					<span className="referral-grain" aria-hidden="true" />
					<div className="referral-step">
						<img className="referral-art" src={ isHosting ? stepHosting : stepProduct } alt="" />
						<p className="referral-step-caption">
							<Pin n={ 1 } />
							<span>
								{ isHosting
									? __( 'Add hosting to a referral cart' )
									: __( 'Add products to a referral cart' ) }
							</span>
						</p>
					</div>
					<div className="referral-step">
						<img className="referral-art" src={ stepRequest } alt="" />
						<p className="referral-step-caption">
							<Pin n={ 2 } />
							{ __( 'Send your client a payment request' ) }
						</p>
					</div>
					<div className="referral-step">
						<img
							className="referral-art"
							src={ isHosting ? stepReferralsHosting : stepReferrals }
							alt=""
						/>
						<p className="referral-step-caption">
							<Pin n={ 3 } />
							{ __( 'Earn every time they pay or renew' ) }
						</p>
					</div>
				</div>
			</section>
			<div ref={ barRef } className="referral-band-bar" inert={ view !== 'bar' }>
				<span className="referral-dot" aria-hidden="true" />
				<span className="referral-band-bar-text">
					<strong>{ __( 'Referring to clients.' ) }</strong> { summary }
				</span>
				<Button
					variant="link"
					onClick={ () => {
						saveFolded( false );
						setChoice( 'band' );
					} }
				>
					{ __( 'How it works' ) }
				</Button>
			</div>
		</div>
	);
}

function Pin( { n }: { n: number } ) {
	return (
		<span className="referral-pin" aria-hidden="true">
			<span>{ n }</span>
		</span>
	);
}
