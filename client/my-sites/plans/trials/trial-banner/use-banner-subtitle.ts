import {
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
	PlanSlug,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import type { Moment } from 'moment/moment';

export default function useBannerSubtitle(
	currentPlanSlug: PlanSlug | null,
	trialExpired: boolean | null,
	trialDaysLeftToDisplay: number,
	trialExpiration: Moment | null,
	selectedSiteId: number | null,
	isEcommerceTrial?: boolean
): string {
	const locale = useLocale();
	const translate = useTranslate();
	const [ bannerSubtitle, setBannerSubtitle ] = useState( '' );
	// moment.js doesn't have a format option to display the long form in a localized way without the year
	// https://github.com/moment/moment/issues/3341
	const readableExpirationDate = trialExpiration?.toDate().toLocaleDateString( locale, {
		month: 'long',
		day: 'numeric',
	} );
	const sitePlans = Plans.useSitePlans( { siteId: selectedSiteId } );
	const anyWooExpressIntroOffer = sitePlans?.data?.[ PLAN_WOOEXPRESS_MEDIUM ].introOffer;

	useEffect( () => {
		// this may need updating for intro offers with singly counted units e.g. 1 month|year
		const introOfferSubtitle =
			isEcommerceTrial && anyWooExpressIntroOffer
				? translate(
						'Your free trial will end in %(daysLeft)d day. Upgrade by %(expirationdate)s to start selling and take advantage of our limited time offer ' +
							'-- any Woo Express plan for just %(introOfferFormattedPrice)s a %(introOfferIntervalUnit)s for your first %(introOfferIntervalCount)d %(introOfferIntervalUnit)ss.',
						'Your free trial will end in %(daysLeft)d days. Upgrade by %(expirationdate)s to start selling and take advantage of our limited time offer ' +
							'-- any Woo Express plan for just %(introOfferFormattedPrice)s a %(introOfferIntervalUnit)s for your first %(introOfferIntervalCount)d %(introOfferIntervalUnit)ss.',
						{
							count: trialDaysLeftToDisplay,
							args: {
								daysLeft: trialDaysLeftToDisplay,
								expirationdate: readableExpirationDate as string,
								introOfferFormattedPrice: anyWooExpressIntroOffer.formattedPrice,
								introOfferIntervalUnit: anyWooExpressIntroOffer.intervalUnit,
								introOfferIntervalCount: anyWooExpressIntroOffer.intervalCount,
							},
						}
				  )
				: null;

		let subtitle;
		switch ( currentPlanSlug ) {
			case PLAN_MIGRATION_TRIAL_MONTHLY:
				if ( trialExpired ) {
					subtitle = translate(
						'Your free trial has expired. Upgrade to a plan to unlock new features and launch your migrated website.'
					);
				} else if ( introOfferSubtitle ) {
					subtitle = introOfferSubtitle;
				} else {
					subtitle = translate(
						'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to unlock new features and launch your migrated website.',
						'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to unlock new features and launch your migrated website.',
						{
							count: trialDaysLeftToDisplay,
							args: {
								daysLeft: trialDaysLeftToDisplay,
								expirationdate: readableExpirationDate as string,
							},
						}
					);
				}
				break;
			default:
				if ( trialExpired ) {
					subtitle = translate(
						'Your free trial has expired. Upgrade to a plan to unlock new features and start selling.'
					);
				} else if ( introOfferSubtitle ) {
					subtitle = introOfferSubtitle;
				} else {
					subtitle = translate(
						'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
						'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
						{
							count: trialDaysLeftToDisplay,
							args: {
								daysLeft: trialDaysLeftToDisplay,
								expirationdate: readableExpirationDate as string,
							},
						}
					);
				}
				break;
		}

		setBannerSubtitle( subtitle as string );
	}, [
		currentPlanSlug,
		trialExpired,
		trialDaysLeftToDisplay,
		readableExpirationDate,
		anyWooExpressIntroOffer,
		isEcommerceTrial,
		translate,
	] );

	return bannerSubtitle;
}
