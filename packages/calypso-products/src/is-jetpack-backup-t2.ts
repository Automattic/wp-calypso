import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackBackupT2Slug } from './is-jetpack-backup-t2-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackBackupT2( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackBackupT2Slug( camelOrSnakeSlug( product ) );
}
