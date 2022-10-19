import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_GLOBAL_STYLES } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function usePremiumGlobalStyles() {
	const params = new URLSearchParams( window.location.search );
	const siteSlugParam = params.get( 'siteSlug' );
	const siteIdParam = params.get( 'siteId' );
	const selectedSiteId = useSelector( getSelectedSiteId );

	const siteId = useSelector( ( state ) => {
		const siteIdOrSlug = selectedSiteId ?? siteIdParam ?? siteSlugParam;
		if ( ! siteIdOrSlug ) {
			return null;
		}
		const site = getSite( state, siteIdOrSlug );
		return site?.ID ?? null;
	} );

	const hasGlobalStyles = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_GLOBAL_STYLES )
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
