import {
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { useTranslate } from 'i18n-calypso';

type Translate = ReturnType< typeof useTranslate >;

export interface CancelCopy {
	label: string;
	description: string;
}

export interface RemoveCopy {
	label: string;
	description: string;
}

/**
 * Copy strings for the Cancel and Remove buttons on legacy Purchase Settings.
 *
 * Button titles are intentionally generic ("Cancel subscription" /
 * "Remove subscription"); product type is surfaced in the micro-copy.
 */

export function getCancelButtonCopy(
	purchase: Purchase,
	expiryDateFormatted: string,
	translate: Translate
): CancelCopy {
	const label = String( translate( 'Cancel subscription' ) );
	if ( isPlan( purchase ) ) {
		return {
			label,
			description: String(
				translate( 'Stop future payments. Keep plan features until %(date)s.', {
					args: { date: expiryDateFormatted },
				} )
			),
		};
	}
	if ( isDomainRegistration( purchase ) || isDomainTransfer( purchase ) ) {
		return {
			label,
			description: String(
				translate( 'Stop future payments. Keep your domain until %(date)s.', {
					args: { date: expiryDateFormatted },
				} )
			),
		};
	}
	if ( isTitanMail( purchase ) || isGSuiteOrGoogleWorkspace( purchase ) ) {
		return {
			label,
			description: String(
				translate( 'Stop future payments. Keep your email until %(date)s.', {
					args: { date: expiryDateFormatted },
				} )
			),
		};
	}
	return {
		label,
		description: String(
			translate( 'Stop future payments. Keep %(productName)s until %(date)s.', {
				args: { productName: purchase.productName, date: expiryDateFormatted },
			} )
		),
	};
}

export function getRemoveButtonCopy(
	purchase: Purchase,
	hasRefund: boolean,
	autoRenewOn: boolean,
	translate: Translate
): RemoveCopy {
	// When auto-renew is OFF, the subscription has already been cancelled —
	// the label shouldn't say "subscription" (there isn't one anymore). Name
	// the thing being removed (plan, domain, email, or product name). When
	// auto-renew is ON, "Remove subscription" is accurate because the user is
	// ending a live subscription in exchange for a refund.
	const label = autoRenewOn
		? String( translate( 'Remove subscription' ) )
		: getRemoveLabelByCategory( purchase, translate );

	if ( isPlan( purchase ) ) {
		return {
			label,
			description: String(
				hasRefund
					? translate( 'Get a refund and remove plan features immediately.' )
					: translate( 'Plan features will be removed immediately.' )
			),
		};
	}
	if ( isDomainRegistration( purchase ) || isDomainTransfer( purchase ) ) {
		return {
			label,
			description: String(
				hasRefund
					? translate( 'Get a refund and remove your domain immediately.' )
					: translate( 'Domain will be removed immediately.' )
			),
		};
	}
	if ( isTitanMail( purchase ) || isGSuiteOrGoogleWorkspace( purchase ) ) {
		return {
			label,
			description: String(
				hasRefund
					? translate( 'Get a refund and remove your email immediately.' )
					: translate( 'Email will be removed immediately.' )
			),
		};
	}
	// Jetpack / Akismet / other: product name in micro-copy.
	const productName = purchase.productName;
	return {
		label,
		description: String(
			hasRefund
				? translate( 'Get a refund and remove %(productName)s immediately.', {
						args: { productName },
				  } )
				: translate( '%(productName)s will be removed immediately.', {
						args: { productName },
				  } )
		),
	};
}

function getRemoveLabelByCategory( purchase: Purchase, translate: Translate ): string {
	if ( isPlan( purchase ) ) {
		return String( translate( 'Remove plan' ) );
	}
	if ( isDomainRegistration( purchase ) || isDomainTransfer( purchase ) ) {
		return String( translate( 'Remove domain' ) );
	}
	if ( isTitanMail( purchase ) || isGSuiteOrGoogleWorkspace( purchase ) ) {
		return String( translate( 'Remove email' ) );
	}
	return String(
		translate( 'Remove %(productName)s', { args: { productName: purchase.productName } } )
	);
}
