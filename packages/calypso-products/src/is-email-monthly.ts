import { isGoogleWorkspaceMonthly } from './is-google-workspace-monthly';
import { isTitanMailMonthly } from './is-titan-mail-monthly';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isEmailMonthly( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGoogleWorkspaceMonthly( product ) || isTitanMailMonthly( product );
}
