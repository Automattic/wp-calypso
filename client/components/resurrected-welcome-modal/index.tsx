import { recordTracksEvent } from '@automattic/calypso-analytics';
import { BigSkyLogo } from '@automattic/components';
import { Button, Icon, Modal } from '@wordpress/components';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { close } from '@wordpress/icons';
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

type CtaVariant = 'primary' | 'secondary' | 'tertiary';
type CtaIcon = 'big-sky';

type CtaConfig = {
	id: string;
	getLabel: ( translate: TranslateFn ) => string;
	href?: string;
	isDismissOnly?: boolean;
	variant?: CtaVariant;
	icon?: CtaIcon;
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
		getTitle: ( translate ) => translate( 'Try our new AI website builder' ),
		getDescription: ( translate ) =>
			translate( 'Create a fully designed, content-ready WordPress website in no time.' ),
		ctas: [
			{
				id: 'ai-only',
				getLabel: ( translate ) => translate( 'Create a new site with AI' ),
				href: CTA_TARGETS.AI,
				variant: 'primary',
				icon: 'big-sky',
			},
		],
	},
	[ WELCOME_BACK_VARIATIONS.MANUAL ]: {
		getTitle: ( translate ) => translate( 'Welcome back!' ),
		getDescription: ( translate ) =>
			translate(
				'Ready to explore our latest upgrades? All paid plans now include access to new themes and plugins.'
			),
		ctas: [
			{
				id: 'manual-new',
				getLabel: ( translate ) => translate( 'Create a new site' ),
				href: CTA_TARGETS.MANUAL,
				variant: 'primary',
			},
			{
				id: 'manual-continue',
				getLabel: ( translate ) => translate( 'Continue where I left off' ),
				isDismissOnly: true,
				variant: 'tertiary',
			},
		],
	},
	[ WELCOME_BACK_VARIATIONS.AI_ONBOARDING ]: {
		getTitle: ( translate ) => translate( 'Welcome back!' ),
		getDescription: ( translate ) =>
			translate(
				'Ready to explore our latest upgrades? Check out our AI website builder, new themes and plugins.'
			),
		ctas: [
			{
				id: 'ai-builder',
				getLabel: ( translate ) => translate( 'Create a new site with AI' ),
				href: CTA_TARGETS.AI,
				variant: 'primary',
				icon: 'big-sky',
			},
			{
				id: 'ai-continue',
				getLabel: ( translate ) => translate( 'Continue where I left off' ),
				isDismissOnly: true,
				variant: 'tertiary',
			},
		],
	},
	[ WELCOME_BACK_VARIATIONS.ALL_OPTIONS ]: {
		getTitle: ( translate ) => translate( 'Welcome back!' ),
		getDescription: ( translate ) =>
			translate(
				'Ready to explore our latest upgrades? Check out our AI website builder, new themes and plugins.'
			),
		ctas: [
			{
				id: 'all-ai',
				getLabel: ( translate ) => translate( 'Create a new site with AI' ),
				href: CTA_TARGETS.AI,
				icon: 'big-sky',
				variant: 'primary',
			},
			{
				id: 'all-manual',
				getLabel: ( translate ) => translate( 'Start with a blank site' ),
				href: CTA_TARGETS.MANUAL,
				variant: 'secondary',
			},
			{
				id: 'all-continue',
				getLabel: ( translate ) => translate( 'Continue where I left off' ),
				isDismissOnly: true,
				variant: 'tertiary',
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
	onVisibilityChange?: ( isVisible: boolean ) => void;
};

export const ResurrectedWelcomeModalGate = ( {
	isSuppressed = false,
	onVisibilityChange,
}: Props ) => {
	const translate = useTranslate();
	const eligibility = useResurrectedFreeUserEligibility();
	const [ hasDismissedForSession, setHasDismissedForSession ] = useState( () =>
		eligibility.isForcedVariation ? false : getInitialDismissState()
	);
	const [ hasTrackedImpression, setHasTrackedImpression ] = useState( false );
	const previousVisibilityRef = useRef( false );

	const variationName = eligibility.variationName as WelcomeBackVariation | null;
	const variationConfig = useMemo(
		() => ( variationName ? VARIATION_CONTENT[ variationName ] : undefined ),
		[ variationName ]
	);
	const variationClassName = variationName
		? `resurrected-welcome-modal--${ variationName.replace( /_/g, '-' ) }`
		: null;
	const hasDarkHero =
		variationName === WELCOME_BACK_VARIATIONS.MANUAL ||
		variationName === WELCOME_BACK_VARIATIONS.AI_ONBOARDING ||
		variationName === WELCOME_BACK_VARIATIONS.ALL_OPTIONS;

	const shouldDisplay =
		! eligibility.isLoading &&
		eligibility.isEligible &&
		! hasDismissedForSession &&
		! isSuppressed &&
		!! variationConfig &&
		variationName !== WELCOME_BACK_VARIATIONS.CONTROL;

	useEffect( () => {
		if ( eligibility.isForcedVariation ) {
			setHasDismissedForSession( false );
		}
	}, [ eligibility.isForcedVariation ] );

	useEffect( () => {
		if ( previousVisibilityRef.current !== shouldDisplay ) {
			previousVisibilityRef.current = shouldDisplay;
			onVisibilityChange?.( shouldDisplay );
		}
	}, [ shouldDisplay, onVisibilityChange ] );

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
			if ( typeof window !== 'undefined' && ! eligibility.isForcedVariation ) {
				window.sessionStorage.setItem( SESSION_STORAGE_KEY, 'true' );
			}
			if ( source === 'close' ) {
				recordTracksEvent( 'calypso_resurrected_welcome_modal_dismiss', {
					variation: variationName ?? 'unknown',
					source,
				} );
			}
		},
		[ variationName, eligibility.isForcedVariation ]
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
			className={ clsx( 'resurrected-welcome-modal', variationClassName ) }
			overlayClassName="resurrected-welcome-modal__overlay"
			title={ title }
			onRequestClose={ () => persistDismissal( 'close' ) }
		>
			<div className="resurrected-welcome-modal__frame">
				<div className="resurrected-welcome-modal__hero">
					<button
						type="button"
						className={ clsx( 'resurrected-welcome-modal__close', {
							'resurrected-welcome-modal__close--light': hasDarkHero,
						} ) }
						onClick={ () => persistDismissal( 'close' ) }
						aria-label={ translate( 'Close welcome back modal' ) }
					>
						<Icon icon={ close } size={ 20 } />
					</button>
				</div>

				<div className="resurrected-welcome-modal__content">
					<h1 className="resurrected-welcome-modal__title">{ title }</h1>
					<p className="resurrected-welcome-modal__description">{ description }</p>

					<div className="resurrected-welcome-modal__actions">
						{ variationConfig.ctas.map( ( cta ) => {
							const variant = cta.variant ?? 'primary';
							const icon =
								cta.icon === 'big-sky' ? (
									<span
										key="icon"
										className="resurrected-welcome-modal__cta-icon"
										aria-hidden="true"
									>
										<BigSkyLogo.CentralLogo size={ 18 } fill="currentColor" />
									</span>
								) : null;

							return (
								<Button
									key={ cta.id }
									variant={ variant }
									onClick={ () => handleCta( cta ) }
									href={ cta.isDismissOnly ? undefined : cta.href }
									className={ clsx(
										'resurrected-welcome-modal__cta',
										`resurrected-welcome-modal__cta--${ variant }`
									) }
								>
									<span className="resurrected-welcome-modal__cta-label">
										{ icon }
										{ cta.getLabel( translate ) }
									</span>
								</Button>
							);
						} ) }
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ResurrectedWelcomeModalGate;
