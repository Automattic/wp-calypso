import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PRODUCT_NO_ADS } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isNoAds( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return PRODUCT_NO_ADS === camelOrSnakeSlug( product );
}
