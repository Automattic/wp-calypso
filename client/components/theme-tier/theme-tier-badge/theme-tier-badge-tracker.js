import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { useThemeTierBadgeContext } from './theme-tier-badge-context';

export default function ThemeTierBadgeTracker() {
	const { themeId } = useThemeTierBadgeContext();

	useEffect( () => {
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell',
			theme: themeId,
		} );
	}, [ themeId ] );
	return null;
}
