import { recordTracksEvent } from '@automattic/calypso-analytics';
import { truncate } from '@automattic/js-utils';
import { Button, Icon, Modal } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { close } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import useLastDraftQuery from 'calypso/data/posts/use-last-draft-query';
import { useResurrectedFreeUserEligibility } from 'calypso/lib/resurrected-users';
import {
	WELCOME_BACK_VARIATIONS,
	type WelcomeBackVariation,
} from 'calypso/lib/resurrected-users/constants';

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
const THEMES_SHOWCASE_URL = '/themes';
const SITE_EDITOR_URL = '/site-editor';
const NEW_POST_URL = '/post';
const DRAFT_TITLE_MAX_LENGTH = 30;

const getDraftCtaLabel = ( translate: TranslateFn, draftTitle: string ): string =>
	String(
		draftTitle
			? translate( 'Finish Draft: "%(draftTitle)s"', {
					args: { draftTitle },
			  } )
			: translate( 'Finish Draft' )
	);

// Rolled-out variation: MANUAL only.
const MANUAL_VARIATION_CONFIG: VariationConfig = {
	getTitle: ( translate ) => translate( 'Welcome back!' ),
	getDescription: ( translate ) =>
		translate(
			'Ready to explore our latest upgrades? All paid plans now include access to new themes and plugins. Pick up where you left off or start fresh with our latest tools.'
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

const VARIATION_CONTENT: Partial< Record< WelcomeBackVariation, VariationConfig > > = {
	[ WELCOME_BACK_VARIATIONS.themes ]: {
		getTitle: ( translate ) => translate( 'Welcome back!' ),
		getDescription: ( translate ) =>
			translate(
				"We've added beautiful new themes since your last visit. Browse around and find what feels right for your site."
			),
		ctas: [
			{
				id: 'manual-new',
				getLabel: ( translate ) => translate( 'Browse new themes' ),
				href: THEMES_SHOWCASE_URL,
				variant: 'primary',
			},
			{
				id: 'manual-continue',
				getLabel: ( translate ) => translate( 'Create a new site' ),
				href: ONBOARDING_URL,
				variant: 'tertiary',
			},
		],
	},
	[ WELCOME_BACK_VARIATIONS.content ]: {
		getTitle: ( translate ) => translate( 'Welcome back!' ),
		getDescription: ( translate ) =>
			translate(
				"Everything you created is still here. Since your last visit, we've added new blocks, ready-made layouts, and a better editing experience."
			),
		ctas: [
			{
				id: 'content-new',
				getLabel: ( translate ) => translate( 'Write your next post' ),
				href: NEW_POST_URL,
				variant: 'primary',
			},
			{
				id: 'content-new-site',
				getLabel: ( translate ) => translate( 'Create a new site' ),
				href: ONBOARDING_URL,
				variant: 'tertiary',
			},
		],
	},
	[ WELCOME_BACK_VARIATIONS.design ]: {
		getTitle: ( translate ) => translate( 'Welcome back!' ),
		getDescription: ( translate ) =>
			translate(
				"We've made it easier than ever to update your colors, fonts, and layout. A few small tweaks can make a big difference for your site."
			),
		ctas: [
			{
				id: 'design-site-editor',
				getLabel: ( translate ) => translate( 'Refresh your site design' ),
				href: SITE_EDITOR_URL,
				variant: 'primary',
			},
			{
				id: 'design-new',
				getLabel: ( translate ) => translate( 'Create a new site' ),
				href: ONBOARDING_URL,
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

	const variationName = eligibility.variationName;
	const isContentVariation =
		eligibility.isEligible && variationName === WELCOME_BACK_VARIATIONS.content;
	const lastDraftQuery = useLastDraftQuery( {
		enabled: isContentVariation && ! hasDismissedForSession,
	} );
	const isContentCtaLoading = isContentVariation && lastDraftQuery.isPending;

	let variationConfig = variationName ? MANUAL_VARIATION_CONFIG : undefined;
	if ( variationName && variationName in VARIATION_CONTENT ) {
		variationConfig = VARIATION_CONTENT[ variationName ];
	}
	let resolvedCtas = variationConfig?.ctas ?? [];
	if ( isContentVariation && lastDraftQuery.data ) {
		const lastDraft = lastDraftQuery.data;
		const truncatedDraftTitle = truncate( lastDraft.title, {
			length: DRAFT_TITLE_MAX_LENGTH,
			omission: '…',
		} );
		resolvedCtas = resolvedCtas.map( ( cta ) =>
			cta.id === 'content-new'
				? {
						id: 'content-draft',
						getLabel: ( translate ) => getDraftCtaLabel( translate, truncatedDraftTitle ),
						href: `/post/${ lastDraft.siteId }/${ lastDraft.id }`,
						variant: 'primary',
				  }
				: cta
		);
	}

	const variationClassName = variationName
		? `resurrected-welcome-modal--${ variationName.replace( /_/g, '-' ) }`
		: null;
	const hasDarkHero = true;

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
						{ resolvedCtas.map( ( cta ) => {
							const variant = cta.variant ?? 'primary';
							const isLoading = isContentCtaLoading && cta.id === 'content-new';
							const label = cta.getLabel( translate );
							const ctaTitle =
								cta.id === 'content-draft' && lastDraftQuery.data
									? getDraftCtaLabel( translate, lastDraftQuery.data.title )
									: undefined;
							return (
								<Button
									key={ cta.id }
									variant={ variant }
									onClick={ isLoading ? undefined : () => handleCta( cta ) }
									href={ isLoading || cta.isDismissOnly ? undefined : cta.href }
									disabled={ isLoading }
									isBusy={ isLoading }
									title={ ctaTitle }
									className={ clsx(
										'resurrected-welcome-modal__cta',
										`resurrected-welcome-modal__cta--${ variant }`
									) }
								>
									<span className="resurrected-welcome-modal__cta-label">{ label }</span>
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
