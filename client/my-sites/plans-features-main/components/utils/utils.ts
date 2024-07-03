import { PlansIntent } from '@automattic/plans-grid-next';

/* For Guided Signup intents we want to force the default plans for the comparison table. See: pdDR7T-1xi-p2 */
export const shouldForceDefaultPlansBasedOnIntent = ( intent: PlansIntent | undefined ) => {
	return (
		intent &&
		[
			'plans-guided-segment-merchant',
			'plans-guided-segment-blogger',
			'plans-guided-segment-nonprofit',
			'plans-guided-segment-consumer-or-business',
			'plans-guided-segment-developer-or-agency',
		].includes( intent )
	);
};
