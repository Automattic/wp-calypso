import { truncate } from '@automattic/js-utils';
import { Button, Icon, Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import clsx from 'clsx';

import './style.scss';

export const WELCOME_BACK_VARIATIONS = {
	themes: 'treatment_themes',
	content: 'treatment_content',
	design: 'treatment_design',
	control: 'control',
} as const;

type CtaVariant = 'primary' | 'secondary' | 'tertiary';

export interface ResurrectedWelcomeModalCta {
	id: string;
	label: string;
	href?: string;
	isDismissOnly?: boolean;
	variant?: CtaVariant;
}

export interface ResurrectedWelcomeModalDraft {
	id: number;
	siteId: number;
	title: string;
}

interface VariationConfig {
	title: string;
	description: string;
	ctas: ResurrectedWelcomeModalCta[];
}

export interface ResurrectedWelcomeModalProps {
	variationName: string;
	lastDraft?: ResurrectedWelcomeModalDraft | null;
	isLastDraftLoading?: boolean;
	resolveHref?: ( href: string ) => string;
	onClose: () => void;
	onCtaClick: ( cta: ResurrectedWelcomeModalCta ) => void;
}

const ONBOARDING_URL = '/setup/onboarding';
const THEMES_SHOWCASE_URL = '/themes';
const SITE_EDITOR_URL = '/site-editor';
const NEW_POST_URL = '/post';
const DRAFT_TITLE_MAX_LENGTH = 30;

function getDraftCtaLabel( draftTitle: string ): string {
	if ( ! draftTitle ) {
		return __( 'Finish Draft' );
	}

	// translators: %s is the title of a draft post.
	return sprintf( __( 'Finish Draft: "%s"' ), draftTitle );
}

function getVariationConfig( variationName: string ): VariationConfig {
	switch ( variationName ) {
		case WELCOME_BACK_VARIATIONS.themes:
			return {
				title: __( 'Welcome back!' ),
				description: __(
					"We've added beautiful new themes since your last visit. Browse around and find what feels right for your site."
				),
				ctas: [
					{
						id: 'manual-new',
						label: __( 'Browse new themes' ),
						href: THEMES_SHOWCASE_URL,
						variant: 'primary',
					},
					{
						id: 'manual-continue',
						label: __( 'Create a new site' ),
						href: ONBOARDING_URL,
						variant: 'tertiary',
					},
				],
			};
		case WELCOME_BACK_VARIATIONS.content:
			return {
				title: __( 'Welcome back!' ),
				description: __(
					"Everything you created is still here. Since your last visit, we've added new blocks, ready-made layouts, and a better editing experience."
				),
				ctas: [
					{
						id: 'content-new',
						label: __( 'Write your next post' ),
						href: NEW_POST_URL,
						variant: 'primary',
					},
					{
						id: 'content-new-site',
						label: __( 'Create a new site' ),
						href: ONBOARDING_URL,
						variant: 'tertiary',
					},
				],
			};
		case WELCOME_BACK_VARIATIONS.design:
			return {
				title: __( 'Welcome back!' ),
				description: __(
					"We've made it easier than ever to update your colors, fonts, and layout. A few small tweaks can make a big difference for your site."
				),
				ctas: [
					{
						id: 'design-site-editor',
						label: __( 'Refresh your site design' ),
						href: SITE_EDITOR_URL,
						variant: 'primary',
					},
					{
						id: 'design-new',
						label: __( 'Create a new site' ),
						href: ONBOARDING_URL,
						variant: 'tertiary',
					},
				],
			};
		default:
			return {
				title: __( 'Welcome back!' ),
				description: __(
					'Ready to explore our latest upgrades? All paid plans now include access to new themes and plugins. Pick up where you left off or start fresh with our latest tools.'
				),
				ctas: [
					{
						id: 'manual-new',
						label: __( 'Create a new site' ),
						href: ONBOARDING_URL,
						variant: 'primary',
					},
					{
						id: 'manual-continue',
						label: __( 'Continue where I left off' ),
						isDismissOnly: true,
						variant: 'tertiary',
					},
				],
			};
	}
}

export default function ResurrectedWelcomeModal( {
	variationName,
	lastDraft,
	isLastDraftLoading = false,
	resolveHref = ( href ) => href,
	onClose,
	onCtaClick,
}: ResurrectedWelcomeModalProps ) {
	const variationConfig = getVariationConfig( variationName );
	const isContentVariation = variationName === WELCOME_BACK_VARIATIONS.content;
	let resolvedCtas = variationConfig.ctas;

	if ( isContentVariation && lastDraft ) {
		const truncatedDraftTitle = truncate( lastDraft.title, {
			length: DRAFT_TITLE_MAX_LENGTH,
			omission: '…',
		} );
		resolvedCtas = resolvedCtas.map( ( cta ) =>
			cta.id === 'content-new'
				? {
						id: 'content-draft',
						label: getDraftCtaLabel( truncatedDraftTitle ),
						href: `/post/${ lastDraft.siteId }/${ lastDraft.id }`,
						variant: 'primary',
				  }
				: cta
		);
	}

	const variationClassName = `resurrected-welcome-modal--${ variationName.replace( /_/g, '-' ) }`;

	return (
		<Modal
			className={ clsx( 'resurrected-welcome-modal', variationClassName ) }
			overlayClassName="resurrected-welcome-modal__overlay"
			title={ variationConfig.title }
			onRequestClose={ onClose }
		>
			<div className="resurrected-welcome-modal__frame">
				<div className="resurrected-welcome-modal__hero">
					<button
						type="button"
						className="resurrected-welcome-modal__close resurrected-welcome-modal__close--light"
						onClick={ onClose }
						aria-label={ __( 'Close welcome back modal' ) }
					>
						<Icon icon={ close } size={ 20 } />
					</button>
				</div>

				<div className="resurrected-welcome-modal__content">
					<h1 className="resurrected-welcome-modal__title">{ variationConfig.title }</h1>
					<p className="resurrected-welcome-modal__description">{ variationConfig.description }</p>

					<div className="resurrected-welcome-modal__actions">
						{ resolvedCtas.map( ( cta ) => {
							const variant = cta.variant ?? 'primary';
							const isLoading =
								isContentVariation && isLastDraftLoading && cta.id === 'content-new';
							const ctaTitle =
								cta.id === 'content-draft' && lastDraft
									? getDraftCtaLabel( lastDraft.title )
									: undefined;

							return (
								<Button
									key={ cta.id }
									variant={ variant }
									onClick={ isLoading ? undefined : () => onCtaClick( cta ) }
									href={
										isLoading || cta.isDismissOnly || ! cta.href
											? undefined
											: resolveHref( cta.href )
									}
									disabled={ isLoading }
									isBusy={ isLoading }
									title={ ctaTitle }
									className={ clsx(
										'resurrected-welcome-modal__cta',
										`resurrected-welcome-modal__cta--${ variant }`
									) }
								>
									<span className="resurrected-welcome-modal__cta-label">{ cta.label }</span>
								</Button>
							);
						} ) }
					</div>
				</div>
			</div>
		</Modal>
	);
}
