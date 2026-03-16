import { type PlansIntent } from '@automattic/plans-grid-next';

export function getVisualSplitPlansIntent( intent?: string | null ): PlansIntent | null {
	if ( intent === 'default_websitebuilder' ) {
		return 'plans-website-builder';
	}
	if ( intent === 'default_hosting' ) {
		return 'plans-wordpress-hosting';
	}
	return null;
}
