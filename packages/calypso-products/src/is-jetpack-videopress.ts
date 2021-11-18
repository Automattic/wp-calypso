import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { JETPACK_VIDEOPRESS_PRODUCTS } from './constants';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackVideoPress( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	const products = JETPACK_VIDEOPRESS_PRODUCTS as ReadonlyArray< string >;
	return products.includes( camelOrSnakeSlug( product ) );
}
