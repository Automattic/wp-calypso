import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PRODUCT_NO_ADS } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAddOn( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	// Right now the definition of an "add-on" just comes from a hardcoded list.
	return camelOrSnakeSlug( product ) === PRODUCT_NO_ADS;
}
