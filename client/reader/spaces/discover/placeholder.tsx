import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

/**
 * Placeholder for a space's Discover tab. The tab is navigable, but the
 * recommendation surface itself isn't built yet — this communicates that rather
 * than rendering an empty panel.
 */
export function SpaceDiscoverPlaceholder() {
	const translate = useTranslate();

	return (
		<VStack className="space-discover-placeholder" alignment="center" spacing={ 2 }>
			<h2 className="space-discover-placeholder__title">
				{ translate( 'Discover is coming soon' ) }
			</h2>
			<p className="space-discover-placeholder__text">
				{ translate( 'Recommendations for this space will show up here.' ) }
			</p>
		</VStack>
	);
}
