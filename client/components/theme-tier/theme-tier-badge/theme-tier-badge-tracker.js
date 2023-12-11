import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';

export default function ThemeTierBadgeTracker( { themeId } ) {
	useEffect( () => {
		recordTracksEvent( 'calypso_upgrade_nudge_impression', {
			cta_name: 'theme-upsell',
			theme: themeId,
		} );
	}, [ themeId ] );
	return null;
}
