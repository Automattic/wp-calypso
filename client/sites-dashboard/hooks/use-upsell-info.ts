import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';

export function useUpsellInfo( site: SiteExcerptData, featureName: string ): string {
	const { __ } = useI18n();
	const hasFeatureEnabled = useSelector( ( state ) =>
		siteHasFeature( state, site.ID, featureName )
	);
	return hasFeatureEnabled ? '' : __( 'Requires a Business Plan' );
}
