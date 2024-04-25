import {
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
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
	isWooExpressTrial?: boolean,
	isEntrepreneurTrial?: boolean
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
	const wooExpressIntroOffers = Plans.useIntroOffersForWooExpress( {
		siteId: selectedSiteId,
		coupon: undefined,
	} );
	const anyWooExpressIntroOffer = Object.values( wooExpressIntroOffers ?? {} )[ 0 ];

	useEffect( () => {
		// this may need updating for intro offers with singly counted units e.g. 1 month|year
		let introOfferSubtitle;
		if (
			isWooExpressTrial &&
			anyWooExpressIntroOffer &&
			'month' === anyWooExpressIntroOffer.intervalUnit
		) {
			if ( trialDaysLeftToDisplay < 1 ) {
				introOfferSubtitle = translate(
					'Your free trial ends today. Upgrade by %(expirationdate)s to start selling and take advantage of our limited time offer ' +
						'— any Woo Express plan for just %(introOfferFormattedPrice)s a month for your first %(introOfferIntervalCount)d months.',
					{
						args: {
							expirationdate: readableExpirationDate as string,
							introOfferFormattedPrice: anyWooExpressIntroOffer.formattedPrice,
							introOfferIntervalCount: anyWooExpressIntroOffer.intervalCount,
						},
					}
				);
			} else {
				introOfferSubtitle = translate(
					'Your free trial will end in %(daysLeft)d day. Upgrade by %(expirationdate)s to start selling and take advantage of our limited time offer ' +
						'— any Woo Express plan for just %(introOfferFormattedPrice)s for your first %(introOfferIntervalCount)d months.',
					'Your free trial will end in %(daysLeft)d days. Upgrade by %(expirationdate)s to start selling and take advantage of our limited time offer ' +
						'— any Woo Express plan for just %(introOfferFormattedPrice)s for your first %(introOfferIntervalCount)d months.',
					{
						count: trialDaysLeftToDisplay,
						args: {
							daysLeft: trialDaysLeftToDisplay,
							expirationdate: readableExpirationDate as string,
							introOfferFormattedPrice: anyWooExpressIntroOffer.formattedPrice,
							introOfferIntervalCount: anyWooExpressIntroOffer.intervalCount,
						},
					}
				);
			}
		}
		let entrepreneurTrialSubtitle;
		if ( isEntrepreneurTrial ) {
			if ( trialDaysLeftToDisplay < 1 ) {
				entrepreneurTrialSubtitle = translate(
					'Your free trial ends today. Add payment method by %(expirationdate)s to continue selling your products and access all the power.',
					{
						args: {
							expirationdate: readableExpirationDate as string,
						},
						comment: '%expirationdate is the date the trial ends',
					}
				);
			} else {
				entrepreneurTrialSubtitle = translate(
					'Your free trial ends in %(daysLeft)d day. Complete the plan purchase by %(expirationdate)s to keep selling and unlock all features!',
					'Your free trial ends in %(daysLeft)d days. Complete the plan purchase by %(expirationdate)s to keep selling and unlock all features!',
					{
						args: {
							daysLeft: trialDaysLeftToDisplay,
							expirationdate: readableExpirationDate as string,
						},
						count: trialDaysLeftToDisplay,
						comment:
							'%daysLeft is the number of days left in the trial, %expirationdate is the date the trial ends',
					}
				);
			}
		}

		let subtitle;
		switch ( currentPlanSlug ) {
			case PLAN_MIGRATION_TRIAL_MONTHLY:
				if ( trialExpired ) {
					subtitle = translate(
						'Your free trial has expired. Upgrade to a plan to unlock new features and launch your migrated website.'
					);
				} else if ( introOfferSubtitle ) {
					subtitle = introOfferSubtitle;
				} else if ( trialDaysLeftToDisplay < 1 ) {
					subtitle = translate(
						'Your free trial ends today. Upgrade to a plan by %(expirationdate)s to unlock new features and launch your migrated website.',
						{
							args: {
								expirationdate: readableExpirationDate as string,
							},
						}
					);
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
			case PLAN_HOSTING_TRIAL_MONTHLY:
				if ( trialExpired ) {
					subtitle = translate(
						'Your free trial has expired. Upgrade to a plan to continue using advanced features.'
					);
				} else if ( trialDaysLeftToDisplay < 1 ) {
					subtitle = translate(
						'Your free trial ends today. Upgrade to a plan by %(expirationdate)s to continue using advanced features.',
						{
							args: {
								expirationdate: readableExpirationDate as string,
							},
						}
					);
				} else {
					subtitle = translate(
						'Your free trial will end in %(daysLeft)d day. Upgrade to a plan by %(expirationdate)s to continue using advanced features.',
						'Your free trial will end in %(daysLeft)d days. Upgrade to a plan by %(expirationdate)s to continue using advanced features.',
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
				} else if ( entrepreneurTrialSubtitle ) {
					subtitle = entrepreneurTrialSubtitle;
				} else if ( introOfferSubtitle ) {
					subtitle = introOfferSubtitle;
				} else if ( trialDaysLeftToDisplay < 1 ) {
					subtitle = translate(
						'Your free trial ends today. Upgrade to a plan by %(expirationdate)s to unlock new features and start selling.',
						{
							args: {
								expirationdate: readableExpirationDate as string,
							},
						}
					);
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
		isWooExpressTrial,
		isEntrepreneurTrial,
		translate,
	] );

	return bannerSubtitle;
}
