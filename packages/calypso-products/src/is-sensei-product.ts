import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { PRODUCT_SENSEI_PRO_YEARLY, PRODUCT_SENSEI_PRO_MONTHLY } from './constants/sensei';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isSenseiProduct( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return [ PRODUCT_SENSEI_PRO_YEARLY, PRODUCT_SENSEI_PRO_MONTHLY ].includes(
		camelOrSnakeSlug( product )
	);
}
