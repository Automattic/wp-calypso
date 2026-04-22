import { __, sprintf } from '@wordpress/i18n';
import type { CancelRemoveCategory } from './classify-purchase-for-copy';

/**
 * Copy for the Cancel and Remove buttons on the dashboard Purchase
 * Settings screen. A parallel helper lives on legacy at
 * `client/me/purchases/manage-purchase/get-cancel-remove-copy.ts` —
 * both surfaces use the same English strings via their native i18n
 * library. Parity is enforced by
 * `client/me/purchases/manage-purchase/test/cancel-remove-copy-parity.test.ts`:
 * if you change a string here, change it there too, or CI will fail.
 */

export interface CancelCopy {
	label: string;
	description: string;
}

export interface RemoveCopy {
	label: string;
	description: string;
}

export interface CancelCopyInput {
	category: CancelRemoveCategory;
	productName: string;
	expiryDateFormatted: string;
}

export interface RemoveCopyInput {
	category: CancelRemoveCategory;
	productName: string;
	hasRefund: boolean;
}

export function getCancelButtonCopy( {
	category,
	productName,
	expiryDateFormatted,
}: CancelCopyInput ): CancelCopy {
	const label = __( 'Cancel subscription' );

	switch ( category ) {
		case 'plan':
			return {
				label,
				description: sprintf(
					// translators: %(date)s is a date like "January 1, 2027"
					__( 'Stop future payments. Keep plan features until %(date)s.' ),
					{ date: expiryDateFormatted }
				),
			};
		case 'domain':
			return {
				label,
				description: sprintf(
					// translators: %(date)s is a date like "January 1, 2027"
					__( 'Stop future payments. Keep your domain until %(date)s.' ),
					{ date: expiryDateFormatted }
				),
			};
		case 'email':
			return {
				label,
				description: sprintf(
					// translators: %(date)s is a date like "January 1, 2027"
					__( 'Stop future payments. Keep your email until %(date)s.' ),
					{ date: expiryDateFormatted }
				),
			};
		case 'marketplace_plugin':
		case 'marketplace_theme':
		case 'other':
			return {
				label,
				description: sprintf(
					// translators: %(productName)s is a product name like "Jetpack Stats"; %(date)s is a date like "January 1, 2027"
					__( 'Stop future payments. Keep %(productName)s until %(date)s.' ),
					{ productName, date: expiryDateFormatted }
				),
			};
	}
}

export function getRemoveButtonCopy( {
	category,
	productName,
	hasRefund,
}: RemoveCopyInput ): RemoveCopy {
	return {
		label: getRemoveLabel( category, productName ),
		description: getRemoveDescription( category, productName, hasRefund ),
	};
}

function getRemoveLabel( category: CancelRemoveCategory, productName: string ): string {
	switch ( category ) {
		case 'plan':
			return __( 'Remove plan' );
		case 'domain':
			return __( 'Remove domain' );
		case 'email':
			return __( 'Remove email' );
		case 'marketplace_plugin':
			return __( 'Remove plugin' );
		case 'marketplace_theme':
			return __( 'Remove theme' );
		case 'other':
			return sprintf(
				// translators: %(productName)s is a product name like "Jetpack Stats"
				__( 'Remove %(productName)s' ),
				{ productName }
			);
	}
}

function getRemoveDescription(
	category: CancelRemoveCategory,
	productName: string,
	hasRefund: boolean
): string {
	switch ( category ) {
		case 'plan':
			return hasRefund
				? __( 'Get a refund and remove plan features immediately.' )
				: __( 'Plan features will be removed immediately.' );
		case 'domain':
			return hasRefund
				? __( 'Get a refund and remove your domain immediately.' )
				: __( 'Domain will be removed immediately.' );
		case 'email':
			return hasRefund
				? __( 'Get a refund and remove your email immediately.' )
				: __( 'Email will be removed immediately.' );
		case 'marketplace_plugin':
		case 'marketplace_theme':
		case 'other':
			return hasRefund
				? sprintf(
						// translators: %(productName)s is a product name like "Jetpack Stats"
						__( 'Get a refund and remove %(productName)s immediately.' ),
						{ productName }
				  )
				: sprintf(
						// translators: %(productName)s is a product name like "Jetpack Stats"
						__( '%(productName)s will be removed immediately.' ),
						{ productName }
				  );
	}
}
