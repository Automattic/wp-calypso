import { addQueryArgs } from '@wordpress/url';

export const EARLY_PROVISION_TARGET_WPCOM_ATOMIC = 'wpcom-atomic';

export function buildEarlyProvisionDestination( {
	specId,
	phSessionId,
	source,
}: {
	specId: string;
	phSessionId?: string | null;
	source?: string | null;
} ): string {
	return addQueryArgs( '/setup/ai-site-builder/', {
		trigger_backend_build: '0',
		spec_id: specId,
		provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
		...( phSessionId ? { _ph: phSessionId } : {} ),
		...( source ? { source } : {} ),
	} );
}
