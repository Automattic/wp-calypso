import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackScanSlug } from './is-jetpack-scan-slug';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isJetpackScan( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	return isJetpackScanSlug( camelOrSnakeSlug( product ) );
}
