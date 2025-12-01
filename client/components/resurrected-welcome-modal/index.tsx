import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Modal } from '@wordpress/components';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useResurrectedFreeUserEligibility } from 'calypso/lib/resurrected-users';
import {
	WELCOME_BACK_VARIATIONS,
	type WelcomeBackVariation,
} from 'calypso/lib/resurrected-users/constants';
import './style.scss';

const SESSION_STORAGE_KEY = 'wpcom_resurrected_welcome_modal_dismissed';

type TranslateFn = ReturnType< typeof useTranslate >;

type CtaConfig = {
	id: string;
	getLabel: ( translate: TranslateFn ) => string;
	href?: string;
	isDismissOnly?: boolean;
};

type VariationConfig = {
	getTitle: ( translate: TranslateFn ) => string;
	getDescription: ( translate: TranslateFn ) => string;
	ctas: CtaConfig[];
};

const CTA_TARGETS = {
	AI: '/setup/ai-site-builder',
	MANUAL: '/setup/onboarding',
} as const;

const VARIATION_CONTENT: Partial< Record< WelcomeBackVariation, VariationConfig > > = {
	[ WELCOME_BACK_VARIATIONS.AI_ONLY ]: {
		getTitle: ( translate ) => translate( 'Rebuild with AI' ),
		getDescription: ( translate ) =>
			translate(
				"Our AI builder can create a modern site in minutes. It's the quickest way to start fresh."
			),
		ctas: [
			{
				id: 'ai-only',
				getLabel: ( translate ) => translate( 'Create a new site with AI' ),
				href: CTA_TARGETS.AI,
			},
		],
	},
	[ WELCOME_BACK_VARIATIONS.MANUAL ]: {
		getTitle: ( translate ) => translate( 'Start over or pick up where you left off' ),
		getDescription: ( translate ) =>
			translate(
				'Create a brand-new site with guided onboarding or head back to your existing dashboard.'
			),
		ctas: [
			{
				id: 'manual-new',
				getLabel: ( translate ) => translate( 'Create a new site' ),
				href: CTA_TARGETS.MANUAL,
			},
			{
				id: 'manual-continue',
				getLabel: ( translate ) => translate( 'Continue where I left' ),
				isDismissOnly: true,
			},
		],
	},
	[ WELCOME_BACK_VARIATIONS.AI_ONBOARDING ]: {
		getTitle: ( translate ) => translate( 'Two quick ways to get going' ),
		getDescription: ( translate ) =>
			translate(
				'Use AI for a head start or continue editing your existing site—whatever suits you best.'
			),
		ctas: [
			{
				id: 'ai-builder',
				getLabel: ( translate ) => translate( 'Create a new site with AI' ),
				href: CTA_TARGETS.AI,
			},
			{
				id: 'ai-continue',
				getLabel: ( translate ) => translate( 'Continue where I left' ),
				isDismissOnly: true,
			},
		],
	},
	[ WELCOME_BACK_VARIATIONS.ALL_OPTIONS ]: {
		getTitle: ( translate ) => translate( 'Pick the path that fits' ),
		getDescription: ( translate ) =>
			translate(
				'Start from scratch manually, let AI handle the heavy lifting, or keep working on your current site.'
			),
		ctas: [
			{
				id: 'all-manual',
				getLabel: ( translate ) => translate( 'Create a new site' ),
				href: CTA_TARGETS.MANUAL,
			},
			{
				id: 'all-ai',
				getLabel: ( translate ) => translate( 'Create a new site with AI' ),
				href: CTA_TARGETS.AI,
			},
			{
				id: 'all-continue',
				getLabel: ( translate ) => translate( 'Continue where I left' ),
				isDismissOnly: true,
			},
		],
	},
};

const getInitialDismissState = () => {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return window.sessionStorage.getItem( SESSION_STORAGE_KEY ) === 'true';
};

type Props = {
	isSuppressed?: boolean;
};

export const ResurrectedWelcomeModalGate = ( { isSuppressed = false }: Props ) => {
	const translate = useTranslate();
	const eligibility = useResurrectedFreeUserEligibility();
	const [ hasDismissedForSession, setHasDismissedForSession ] = useState( getInitialDismissState );
	const [ hasTrackedImpression, setHasTrackedImpression ] = useState( false );

	const variationName = eligibility.variationName as WelcomeBackVariation | null;
	const variationConfig = useMemo(
		() => ( variationName ? VARIATION_CONTENT[ variationName ] : undefined ),
		[ variationName ]
	);

	const shouldDisplay =
		! eligibility.isLoading &&
		eligibility.isEligible &&
		! hasDismissedForSession &&
		! isSuppressed &&
		!! variationConfig &&
		variationName !== WELCOME_BACK_VARIATIONS.CONTROL;

	useEffect( () => {
		if ( ! shouldDisplay || hasTrackedImpression || ! variationName ) {
			return;
		}

		recordTracksEvent( 'calypso_resurrected_welcome_modal_impression', {
			variation: variationName,
		} );
		setHasTrackedImpression( true );
	}, [ shouldDisplay, variationName, hasTrackedImpression ] );

	const persistDismissal = useCallback(
		( source: 'cta' | 'close' = 'cta' ) => {
			setHasDismissedForSession( true );
			if ( typeof window !== 'undefined' ) {
				window.sessionStorage.setItem( SESSION_STORAGE_KEY, 'true' );
			}
			recordTracksEvent( 'calypso_resurrected_welcome_modal_dismiss', {
				variation: variationName ?? 'unknown',
				source,
			} );
		},
		[ variationName ]
	);

	const handleCta = useCallback(
		( cta: CtaConfig ) => {
			if ( ! variationName ) {
				return;
			}

			recordTracksEvent( 'calypso_resurrected_welcome_modal_cta_click', {
				variation: variationName,
				cta_id: cta.id,
			} );

			if ( cta.isDismissOnly ) {
				persistDismissal( 'cta' );
				return;
			}

			if ( cta.href ) {
				window.location.assign( cta.href );
			}
		},
		[ variationName, persistDismissal ]
	);

	if ( ! shouldDisplay || ! variationConfig ) {
		return null;
	}

	const title = variationConfig?.getTitle( translate ) ?? '';
	const description = variationConfig?.getDescription( translate ) ?? '';

	return (
		<Modal
			className="resurrected-welcome-modal"
			title={ title }
			onRequestClose={ () => persistDismissal( 'close' ) }
		>
			<p>{ description }</p>
			<div className="resurrected-welcome-modal__actions">
				{ variationConfig.ctas.map( ( cta ) => (
					<Button
						key={ cta.id }
						variant={ cta.isDismissOnly ? undefined : 'primary' }
						onClick={ () => handleCta( cta ) }
						href={ cta.isDismissOnly ? undefined : cta.href }
						className={ clsx( {
							'resurrected-welcome-modal__cta-secondary': cta.isDismissOnly,
						} ) }
					>
						{ cta.getLabel( translate ) }
					</Button>
				) ) }
			</div>
		</Modal>
	);
};

export default ResurrectedWelcomeModalGate;
