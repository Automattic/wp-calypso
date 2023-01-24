import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackBackupT1Slug } from './is-jetpack-backup-t1-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackBackupT1( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackBackupT1Slug( camelOrSnakeSlug( product ) );
}
