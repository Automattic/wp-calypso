import { useLocale } from '@automattic/i18n-utils';
import { useEffect } from 'react';
import { useHelpCenterTracksEvent } from '../hooks/use-help-center-tracks-event';
import { Banner, LinkListItem } from './help-center-cta-variants';
import './help-center-cta.scss';
import type { HelpCenterCTAVariantProps } from './help-center-cta-variants';

interface HelpCenterCTAVariantDefinition {
	/** Where this variant renders. Reported with the Tracks events. */
	placement: string;
	Component: React.FC< HelpCenterCTAVariantProps >;
}

/**
 * Every variant the backend can ask for. A new one is a new entry here plus a
 * component in `help-center-cta-variants.tsx` — nothing else knows the list.
 */
export const HELP_CENTER_CTA_VARIANTS = {
	banner: { placement: 'help-center-home', Component: Banner },
	'link-list-item': { placement: 'help-center-more-resources', Component: LinkListItem },
} as const satisfies Record< string, HelpCenterCTAVariantDefinition >;

export type HelpCenterCTAVariant = keyof typeof HELP_CENTER_CTA_VARIANTS;

export interface HelpCenterCTAProps extends Omit< HelpCenterCTAVariantProps, 'onClick' > {
	variant: HelpCenterCTAVariant;
	ctaId: string;
	purchasedAt?: number;
	planFamily?: string;
}

// Module-level so it survives remounts (e.g. search filtering the More
// resources list) and only resets on a full page load, per cta_id.
const reportedCtaIds = new Set< string >();

const DAYS_SINCE_PURCHASE_MAX = 29;

/** `purchasedAt` is a unix timestamp in seconds. Clamped to the 0-29 day window. */
function daysSincePurchase( purchasedAt: number ): number {
	const days = Math.floor( ( Date.now() / 1000 - purchasedAt ) / 86400 );
	return Math.min( Math.max( days, 0 ), DAYS_SINCE_PURCHASE_MAX );
}

type CTAEventProps = {
	cta_id: string;
	variant: string;
	placement: string;
	plan_family?: string;
	locale?: string;
};

function useCTATracking( eventProps: CTAEventProps | null, purchasedAt?: number ) {
	const recordTracksEvent = useHelpCenterTracksEvent();

	useEffect( () => {
		if ( ! eventProps || reportedCtaIds.has( eventProps.cta_id ) ) {
			return;
		}
		reportedCtaIds.add( eventProps.cta_id );
		recordTracksEvent( 'calypso_helpcenter_cta_impression', {
			...eventProps,
			...( Number.isFinite( purchasedAt ) && {
				days_since_purchase: daysSincePurchase( purchasedAt as number ),
			} ),
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ eventProps?.cta_id ] );

	return () => {
		if ( ! eventProps ) {
			return;
		}
		recordTracksEvent( 'calypso_helpcenter_cta_click', {
			...eventProps,
			...( Number.isFinite( purchasedAt ) && {
				days_since_purchase: daysSincePurchase( purchasedAt as number ),
			} ),
		} );
	};
}

export const HelpCenterCTA: React.FC< HelpCenterCTAProps > = ( {
	variant,
	ctaId,
	purchasedAt,
	planFamily,
	...content
} ) => {
	const variantDefinition = HELP_CENTER_CTA_VARIANTS[ variant ];
	const locale = useLocale();
	const trackClick = useCTATracking(
		variantDefinition
			? {
					cta_id: ctaId,
					variant,
					placement: variantDefinition.placement,
					...( planFamily && { plan_family: planFamily } ),
					...( locale && { locale } ),
			  }
			: null,
		purchasedAt
	);

	if ( ! variantDefinition ) {
		return null;
	}

	const { Component } = variantDefinition;
	return <Component { ...content } onClick={ trackClick } />;
};
