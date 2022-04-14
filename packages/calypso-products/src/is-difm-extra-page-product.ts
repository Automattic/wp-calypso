import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { WPCOM_DIFM_EXTRA_PAGE } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isDIFMExtraPageProduct( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === WPCOM_DIFM_EXTRA_PAGE;
}
