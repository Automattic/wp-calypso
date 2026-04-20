import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Icon, Modal } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useResurrectedFreeUserEligibility } from 'calypso/lib/resurrected-users';

import './style.scss';

const SESSION_STORAGE_KEY = 'wpcom_resurrected_welcome_modal_dismissed';

type TranslateFn = ReturnType< typeof useTranslate >;

type CtaVariant = 'primary' | 'secondary' | 'tertiary';

type CtaConfig = {
	id: string;
	getLabel: ( translate: TranslateFn ) => string;
	href?: string;
	isDismissOnly?: boolean;
	variant?: CtaVariant;
};

type VariationConfig = {
	getTitle: ( translate: TranslateFn ) => string;
	getDescription: ( translate: TranslateFn ) => string;
	ctas: CtaConfig[];
};

const ONBOARDING_URL = '/setup/onboarding';

// Rolled-out variation: MANUAL only.
const MANUAL_VARIATION_CONFIG: VariationConfig = {
	getTitle: ( translate ) => translate( 'Welcome back!' ),
	getDescription: ( translate ) =>
		translate(
			'Ready to explore our latest upgrades? All paid plans now include access to new themes and plugins.'
		),
	ctas: [
		{
			id: 'manual-new',
			getLabel: ( translate ) => translate( 'Create a new site' ),
			href: ONBOARDING_URL,
			variant: 'primary',
		},
		{
			id: 'manual-continue',
			getLabel: ( translate ) => translate( 'Continue where I left off' ),
			isDismissOnly: true,
			variant: 'tertiary',
		},
	],
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

	const variationName = eligibility.variationName;
	const variationConfig = variationName ? MANUAL_VARIATION_CONFIG : undefined;
	const variationClassName = variationName
		? `resurrected-welcome-modal--${ variationName.replace( /_/g, '-' ) }`
		: null;
	const hasDarkHero = true; // MANUAL variation uses dark hero

	const shouldDisplay =
		! eligibility.isLoading &&
		eligibility.isEligible &&
		! hasDismissedForSession &&
		! isSuppressed &&
		!! variationConfig;

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
