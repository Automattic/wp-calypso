import { __ } from '@wordpress/i18n';
import type { Site } from '@automattic/api-core';

export function getVisibilityLabels() {
	return {
		public: __( 'Public' ),
		private: __( 'Private' ),
		coming_soon: __( 'Coming soon' ),
	};
}

export function getSiteVisibility( item: Site ) {
	if ( item.is_coming_soon || ( item.is_private && item.launch_status === 'unlaunched' ) ) {
		return 'coming_soon';
	}

	if ( item.is_private ) {
		return 'private';
	}

	return 'public';
}

export function getSiteVisibilityLabel( item: Site ) {
	const visibilityLabels = getVisibilityLabels();
	return visibilityLabels[ getSiteVisibility( item ) ];
}
