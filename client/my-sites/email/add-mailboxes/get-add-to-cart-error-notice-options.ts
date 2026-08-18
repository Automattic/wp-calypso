import type { CartActionError } from '@automattic/shopping-cart';
import type { NoticeOptions } from 'calypso/state/notices/types';
import type { translate as translateType } from 'i18n-calypso';

/**
 * Returned by the server's `remove_duplicate_email_products` cart validator when the
 * cart already holds an email product for the domain.
 */
export const ERROR_ALREADY_CONTAINS_AN_EMAIL_PRODUCT = 'already-contains-an-email-product';

/**
 * Builds the notice shown when adding mailboxes to the cart is rejected.
 *
 * The notice id matches the cart message code so that this notice and any notice
 * raised by CartMessages for the same error collapse into one rather than stacking.
 */
export const getAddToCartErrorNoticeOptions = ( {
	checkoutPath,
	error,
	translate,
}: {
	checkoutPath: string;
	error: CartActionError;
	translate: typeof translateType;
} ): NoticeOptions => {
	const noticeOptions: NoticeOptions = {
		id: error.code,
		isPersistent: true,
	};

	// This error is only actionable if the user can reach the cart that holds the
	// conflicting email product.
	if ( error.code === ERROR_ALREADY_CONTAINS_AN_EMAIL_PRODUCT ) {
		noticeOptions.button = translate( 'Shopping cart' );
		noticeOptions.href = checkoutPath;
	}

	return noticeOptions;
};
