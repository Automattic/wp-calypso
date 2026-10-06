import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { Notice } from '../../components/notice';
import stepProduct from './images/referral/step-1-add.svg';
import stepRequest from './images/referral/step-2-send.svg';
import stepReferrals from './images/referral/step-3-earn.svg';
import type { ReactNode } from 'react';

import './referral-mode-pass.scss';

// A4AD-217, `?referral=`:
//   g   Main today: “Refer products” toggle, info icon, five-slide guide on the first switch.
//   h   the toggle reads “Refer to clients”, no info icon, no guide on the switch,
//       and a notice that can't be dismissed while referral mode is on.
//   hb  (default) H with the earning shown before the switch (a chip beside the toggle) and,
//       once on, a band: what you earn, and the three steps as SVGs exported from
//       Figma “Marketplace Graphics” › Referral / product, request, referrals (the
//       Featured drawings' grammar) on the Amplify blue field. No guide: the band
//       is the walkthrough. “Got it” folds
//       it to a one-line bar that stays while referral mode is on.
// The choice sticks for the session so Hosting and Products agree.
const STORAGE_KEY = 'a4a-referral-treatment';
const BAND_FOLDED_KEY = 'a4a-referral-band-folded';
// The band's ground, `?field=`: n flat light blue (default), o flat neutral grey,
// p the Amplify field at 35%. Figma › Referral steps v2 (A4AD-217).
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
};

function readFolded() {
	try {
		return window.sessionStorage.getItem( BAND_FOLDED_KEY ) === '1';
	} catch {
		return false;
	}
}

function writeFolded( folded: boolean ) {
	try {
		window.sessionStorage.setItem( BAND_FOLDED_KEY, folded ? '1' : '0' );
	} catch {}
}

export function ReferralModeBand( { headline, summary }: BandProps ) {
	const [ state, setState ] = useState< 'open' | 'folding' | 'folded' >( () =>
		readFolded() ? 'folded' : 'open'
	);

	if ( state === 'folded' ) {
		return (
			<div className="referral-band-bar">
				<span className="referral-dot" aria-hidden="true" />
				<span className="referral-band-bar-text">
					<strong>{ __( 'Referring to clients.' ) }</strong> { summary }
				</span>
				<Button
					variant="link"
					onClick={ () => {
						writeFolded( false );
						setState( 'open' );
					} }
				>
					{ __( 'How it works' ) }
				</Button>
			</div>
		);
	}

	return (
		<div
			className={ clsx( 'referral-band-reveal', state === 'folding' && 'is-folding' ) }
			onAnimationEnd={ ( event ) => {
				if ( state === 'folding' && event.target === event.currentTarget ) {
					setState( 'folded' );
				}
			} }
		>
			<section className="referral-band" aria-label={ __( 'Referral mode' ) }>
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
								writeFolded( true );
								setState(
									window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
										? 'folded'
										: 'folding'
								);
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
						<img className="referral-art" src={ stepProduct } alt="" />
						<p className="referral-step-caption">
							<Pin n={ 1 } />
							{ __( 'Add products to a referral cart' ) }
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
						<img className="referral-art" src={ stepReferrals } alt="" />
						<p className="referral-step-caption">
							<Pin n={ 3 } />
							{ __( 'Earn every time they pay or renew' ) }
						</p>
					</div>
				</div>
			</section>
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
