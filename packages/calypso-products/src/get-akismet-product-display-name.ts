import { getAkismetBusiness5kProductDisplayName } from './get-akismet-business-5k-product-display-name';
import { getAkismetPro500ProductDisplayName } from './get-akismet-pro-500-product-display-name';
import { isAkismetBusiness5k } from './is-akismet-business-5k';
import { isAkismetPro500 } from './is-akismet-pro-500';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

/**
 * Returns the display name for an Akismet Pro or Business product, appending the
 * current monthly request allotment (e.g. "Akismet Pro (8K requests/month)").
 * For any other product, the given product name is returned unchanged.
 */
export function getAkismetProductDisplayName(
	product: WithCamelCaseSlug | WithSnakeCaseSlug,
	productName: string,
	quantity: number | null
): string {
	if ( isAkismetPro500( product ) ) {
		return getAkismetPro500ProductDisplayName( productName, quantity );
	}

	if ( isAkismetBusiness5k( product ) ) {
		return getAkismetBusiness5kProductDisplayName( productName );
	}

	return productName;
}
