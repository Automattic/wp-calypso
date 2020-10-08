/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */
import { getName, getSubscriptionEndDate, isRefundable } from 'calypso/lib/purchases';
import {
	isDomainMapping,
	isGoogleApps,
	isJetpackPlan,
	isDotComPlan,
	isPlan,
	isTheme,
} from 'calypso/lib/products-values';

export function cancellationEffectHeadline( purchase, translate ) {
	const { domain } = purchase;
	const purchaseName = getName( purchase );

	if ( isRefundable( purchase ) ) {
		return translate(
			'Are you sure you want to cancel and remove %(purchaseName)s from {{em}}%(domain)s{{/em}}? ',
			{
				args: {
					purchaseName,
					domain,
				},
				components: {
					em: <em />,
				},
			}
		);
	}

	return translate(
		'Are you sure you want to cancel %(purchaseName)s for {{em}}%(domain)s{{/em}}? ',
		{
			args: {
				purchaseName,
				domain,
			},
			components: {
				em: <em />,
			},
		}
	);
}

function refundableCancellationEffectDetail( purchase, translate, overrides ) {
	const refundText = overrides.refundText || purchase.refundText;

	if ( isTheme( purchase ) ) {
		return translate(
			"Your site's appearance will revert to its previously selected theme and you will be refunded %(cost)s.",
			{
				args: {
					cost: refundText,
				},
			}
		);
	}

	if ( isGoogleApps( purchase ) ) {
		return translate(
			'You will be refunded %(cost)s, but your G Suite account will continue working without interruption. ' +
				'You will be able to manage your G Suite billing directly through Google.',
			{
				args: {
					cost: refundText,
				},
			}
		);
	}

	if ( isJetpackPlan( purchase ) ) {
		return translate(
			'All plan features - spam filtering, backups, and security screening - will be removed from your site ' +
				'and you will be refunded %(cost)s.',
			{
				args: {
					cost: refundText,
				},
			}
		);
	}

	if ( isDotComPlan( purchase ) ) {
		return translate(
			'All plan features and custom changes will be removed from your site and you will be refunded %(cost)s.',
			{
				args: {
					cost: refundText,
				},
			}
		);
	}

	return translate( 'You will be refunded %(cost)s.', {
		args: {
			cost: refundText,
		},
	} );
}

function nonrefundableCancellationEffectDetail( purchase, translate ) {
	const subscriptionEndDate = getSubscriptionEndDate( purchase );

	if ( isGoogleApps( purchase ) ) {
		return translate(
			'Your G Suite account remains active until it expires on %(subscriptionEndDate)s.',
			{
				args: {
					subscriptionEndDate,
				},
			}
		);
	}

	if ( isDomainMapping( purchase ) ) {
		return translate(
			'Your domain mapping remains active until it expires on %(subscriptionEndDate)s.',
			{
				args: {
					subscriptionEndDate,
				},
			}
		);
	}

	if ( isPlan( purchase ) ) {
		return translate(
			"Your plan's features remain active until your subscription expires on %(subscriptionEndDate)s.",
			{
				args: {
					subscriptionEndDate,
				},
			}
		);
	}

	return '';
}

export function cancellationEffectDetail( purchase, translate, overrides = {} ) {
	if ( isRefundable( purchase ) ) {
		return refundableCancellationEffectDetail( purchase, translate, overrides );
	}
	return nonrefundableCancellationEffectDetail( purchase, translate );
}
