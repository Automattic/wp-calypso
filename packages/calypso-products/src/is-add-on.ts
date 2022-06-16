import { isNoAds } from './is-no-ads';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAddOn( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	// Right now the definition of an "add-on" just comes from a hardcoded list.
	return isNoAds( product );
}
