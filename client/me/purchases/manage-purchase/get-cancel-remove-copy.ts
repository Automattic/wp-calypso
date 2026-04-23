import type { CancelRemoveCategory } from './classify-purchase-for-copy';
import type { LocalizeProps } from 'i18n-calypso';

type Translate = LocalizeProps[ 'translate' ];

/**
 * Copy for the Cancel and Remove buttons on legacy Purchase Settings.
 * A parallel helper lives on the new dashboard at
 * `client/dashboard/me/billing-purchases/purchase-settings/get-cancel-remove-copy.ts` —
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
	translate: Translate;
}

export interface RemoveCopyInput {
	category: CancelRemoveCategory;
	productName: string;
	hasRefund: boolean;
	translate: Translate;
}

export function getCancelButtonCopy( {
	category,
	productName,
	expiryDateFormatted,
	translate,
}: CancelCopyInput ): CancelCopy {
	const label = String( translate( 'Cancel subscription' ) );

	switch ( category ) {
		case 'plan':
			return {
				label,
				description: String(
					translate( 'Stop future payments. Keep plan features until %(date)s.', {
						args: { date: expiryDateFormatted },
					} )
				),
			};
		case 'domain':
			return {
				label,
				description: String(
					translate( 'Stop future payments. Keep your domain until %(date)s.', {
						args: { date: expiryDateFormatted },
					} )
				),
			};
		case 'email':
			return {
				label,
				description: String(
					translate( 'Stop future payments. Keep your email until %(date)s.', {
						args: { date: expiryDateFormatted },
					} )
				),
			};
		case 'marketplace_plugin':
		case 'marketplace_theme':
		case 'other':
			return {
				label,
				description: String(
					translate( 'Stop future payments. Keep %(productName)s until %(date)s.', {
						args: { productName, date: expiryDateFormatted },
					} )
				),
			};
	}
}

export function getRemoveButtonCopy( {
	category,
	productName,
	hasRefund,
	translate,
}: RemoveCopyInput ): RemoveCopy {
	return {
		label: getRemoveLabel( category, productName, translate ),
		description: getRemoveDescription( category, productName, hasRefund, translate ),
	};
}

function getRemoveLabel(
	category: CancelRemoveCategory,
	productName: string,
	translate: Translate
): string {
	switch ( category ) {
		case 'plan':
			return String( translate( 'Remove plan' ) );
		case 'domain':
			return String( translate( 'Remove domain' ) );
		case 'email':
			return String( translate( 'Remove email' ) );
		case 'marketplace_plugin':
			return String( translate( 'Remove plugin' ) );
		case 'marketplace_theme':
			return String( translate( 'Remove theme' ) );
		case 'other':
			return String(
				translate( 'Remove %(productName)s', {
					args: { productName },
				} )
			);
	}
}

function getRemoveDescription(
	category: CancelRemoveCategory,
	productName: string,
	hasRefund: boolean,
	translate: Translate
): string {
	switch ( category ) {
		case 'plan':
			return String(
				hasRefund
					? translate( 'Get a refund and remove plan features immediately.' )
					: translate( 'Plan features will be removed immediately.' )
			);
		case 'domain':
			return String(
				hasRefund
					? translate( 'Get a refund and remove your domain immediately.' )
					: translate( 'Domain will be removed immediately.' )
			);
		case 'email':
			return String(
				hasRefund
					? translate( 'Get a refund and remove your email immediately.' )
					: translate( 'Email will be removed immediately.' )
			);
		case 'marketplace_plugin':
		case 'marketplace_theme':
		case 'other':
			return String(
				hasRefund
					? translate( 'Get a refund and remove %(productName)s immediately.', {
							args: { productName },
					  } )
					: translate( '%(productName)s will be removed immediately.', {
							args: { productName },
					  } )
			);
	}
}
