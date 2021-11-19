import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isJetpackBackupSlug } from './is-jetpack-backup-slug';
import { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isJetpackBackup( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isJetpackBackupSlug( camelOrSnakeSlug( product ) );
}
