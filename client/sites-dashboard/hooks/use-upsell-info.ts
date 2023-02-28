import { __ } from '@wordpress/i18n';
import { useSelector } from 'react-redux';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';

export const UPSELL_TEXT = __( 'Requires a Business Plan' );

export function useUpsellInfo( site: SiteExcerptData, featureName: string ): string {
	const hasFeatureEnabled = useSelector( ( state ) =>
		siteHasFeature( state, site.ID, featureName )
	);
	return hasFeatureEnabled ? '' : UPSELL_TEXT;
}
