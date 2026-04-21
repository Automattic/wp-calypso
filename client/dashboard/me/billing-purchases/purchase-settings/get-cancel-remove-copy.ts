import { __, sprintf } from '@wordpress/i18n';
import { isGoogleWorkspace, isTitanMail } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

/**
 * Copy strings for the Cancel and Remove buttons on Purchase Settings.
 *
 * Cancel always reads "Cancel subscription" (cancelling stops auto-renewal —
 * the plan/domain/email itself stays active until expiry). Remove labels are
 * product-aware ("Remove plan" / "Remove domain" / "Remove email" / "Remove
 * %(productName)s") to match the confirmation-screen heading.
 */

export interface CancelCopy {
	label: string;
	description: string;
}

export interface RemoveCopy {
	label: string;
	description: string;
}

export function getCancelButtonCopy( purchase: Purchase, expiryDateFormatted: string ): CancelCopy {
	const label = __( 'Cancel subscription' );
	if ( purchase.is_plan ) {
		return {
			label,
			description: sprintf(
				// translators: %(date)s is a date like "January 1, 2027"
				__( 'Stop future payments. Keep plan features until %(date)s.' ),
				{ date: expiryDateFormatted }
			),
		};
	}
	if ( purchase.is_domain_registration || isDomainTransfer( purchase ) ) {
		return {
			label,
			description: sprintf(
				// translators: %(date)s is a date like "January 1, 2027"
				__( 'Stop future payments. Keep your domain until %(date)s.' ),
				{ date: expiryDateFormatted }
			),
		};
	}
	if ( isTitanMail( purchase ) || isGoogleWorkspace( purchase ) ) {
		return {
			label,
			description: sprintf(
				// translators: %(date)s is a date like "January 1, 2027"
				__( 'Stop future payments. Keep your email until %(date)s.' ),
				{ date: expiryDateFormatted }
			),
		};
	}
	// Jetpack / Akismet / other: use the product name in the micro-copy.
	return {
		label,
		description: sprintf(
			// translators: %(productName)s is a product name like "Jetpack Stats"; %(date)s is a date like "January 1, 2027"
			__( 'Stop future payments. Keep %(productName)s until %(date)s.' ),
			{ productName: purchase.product_name, date: expiryDateFormatted }
		),
	};
}

export function getRemoveButtonCopy( purchase: Purchase, hasRefund: boolean ): RemoveCopy {
	const label = getRemoveLabelByCategory( purchase );

	if ( purchase.is_plan ) {
		return {
			label,
			description: hasRefund
				? __( 'Get a refund and remove plan features immediately.' )
				: __( 'Plan features will be removed immediately.' ),
		};
	}
	if ( purchase.is_domain_registration || isDomainTransfer( purchase ) ) {
		return {
			label,
			description: hasRefund
				? __( 'Get a refund and remove your domain immediately.' )
				: __( 'Domain will be removed immediately.' ),
		};
	}
	if ( isTitanMail( purchase ) || isGoogleWorkspace( purchase ) ) {
		return {
			label,
			description: hasRefund
				? __( 'Get a refund and remove your email immediately.' )
				: __( 'Email will be removed immediately.' ),
		};
	}
	// Jetpack / Akismet / other: use the product name in the micro-copy.
	const productName = purchase.product_name;
	return {
		label,
		description: hasRefund
			? sprintf(
					// translators: %(productName)s is a product name like "Jetpack Stats"
					__( 'Get a refund and remove %(productName)s immediately.' ),
					{ productName }
			  )
			: sprintf(
					// translators: %(productName)s is a product name like "Jetpack Stats"
					__( '%(productName)s will be removed immediately.' ),
					{ productName }
			  ),
	};
}

function getRemoveLabelByCategory( purchase: Purchase ): string {
	if ( purchase.is_plan ) {
		return __( 'Remove plan' );
	}
	if ( purchase.is_domain_registration || isDomainTransfer( purchase ) ) {
		return __( 'Remove domain' );
	}
	if ( isTitanMail( purchase ) || isGoogleWorkspace( purchase ) ) {
		return __( 'Remove email' );
	}
	return sprintf(
		// translators: %(productName)s is a product name like "Jetpack Stats"
		__( 'Remove %(productName)s' ),
		{ productName: purchase.product_name }
	);
}

export function isDomainTransfer( purchase: Pick< Purchase, 'product_slug' > ): boolean {
	return purchase.product_slug === 'domain_transfer';
}
