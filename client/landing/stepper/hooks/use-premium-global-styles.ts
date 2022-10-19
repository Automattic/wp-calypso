import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_GLOBAL_STYLES } from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { SITE_STORE } from 'calypso/landing/stepper/stores';

export function usePremiumGlobalStyles() {
	const siteId = useSite()?.ID;

	const hasGlobalStyles = useSelect( ( select ) =>
		select( SITE_STORE ).siteHasFeature( siteId, WPCOM_FEATURES_GLOBAL_STYLES )
	);

	// Do not limit Global Styles on sites created before we made it a paid feature. This cutoff
	// blog ID needs to be updated as part of the public launch.
	const shouldLimitGlobalStyles = siteId
		? siteId > 210494207 && ! hasGlobalStyles && isEnabled( 'limit-global-styles' )
		: isEnabled( 'limit-global-styles' );

	return {
		shouldLimitGlobalStyles,
	};
}
