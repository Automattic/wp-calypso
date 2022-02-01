import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { WPCOM_DIFM_LITE } from './constants';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isDIFMProduct( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return camelOrSnakeSlug( product ) === WPCOM_DIFM_LITE;
}
