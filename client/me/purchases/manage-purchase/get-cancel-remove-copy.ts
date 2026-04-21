import {
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { LocalizeProps } from 'i18n-calypso';

type Translate = LocalizeProps[ 'translate' ];

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
 * Cancel always reads "Cancel subscription" (cancelling stops auto-renewal —
 * the plan/domain/email itself stays active until expiry). Remove labels are
 * product-aware ("Remove plan" / "Remove domain" / "Remove email" / "Remove
 * %(productName)s") to match the confirmation-screen heading.
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
	_autoRenewOn: boolean,
	translate: Translate
): RemoveCopy {
	const label = getRemoveLabelByCategory( purchase, translate );

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
