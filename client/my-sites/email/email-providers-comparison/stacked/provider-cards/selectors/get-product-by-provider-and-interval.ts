import 'calypso/state/products-list/init';
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	TITAN_MAIL_MONTHLY_SLUG,
	TITAN_MAIL_YEARLY_SLUG,
} from '@automattic/calypso-products';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { AppState } from 'calypso/types';

/**
 * Returns the correct product slug for the specified provider and interval using a map.
 */
const getProductSlugForProviderAndInterval = (
	provider: EmailProvider,
	intervalLength: IntervalLength
) =>
	( {
		[ EmailProvider.Titan ]: {
			[ IntervalLength.MONTHLY ]: TITAN_MAIL_MONTHLY_SLUG,
			[ IntervalLength.ANNUALLY ]: TITAN_MAIL_YEARLY_SLUG,
		},
		[ EmailProvider.Google ]: {
			[ IntervalLength.MONTHLY ]: GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
			[ IntervalLength.ANNUALLY ]: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
		},
	} )[ provider ][ intervalLength ];

/**
 * Retrieves the product for the specified provider and interval.
 */
const getProductByProviderAndInterval = (
	state: AppState,
	provider: EmailProvider,
	intervalLength: IntervalLength
): ProductListItem | null =>
	getProductBySlug( state, getProductSlugForProviderAndInterval( provider, intervalLength ) );

export { getProductByProviderAndInterval };
