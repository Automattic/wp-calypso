import {
	FEATURE_TYPE_JETPACK_STATS,
	PRODUCT_JETPACK_STATS_MONTHLY,
} from '@automattic/calypso-products';
import ItemPreviewPaneFooter from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/item-preview-pane-footer';
import DocumentHead from 'calypso/components/data/document-head';
import UpsellProductCard from 'calypso/components/jetpack/upsell-product-card';
import InsightsStats from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/insights-stats';
import { Site } from '../../types';

type Props = {
	site: Site;
	trackEvent: ( eventName: string ) => void;
};

export function JetpackStatsPreview( { site, trackEvent }: Props ) {
	const shouldShowUpsell =
		! site?.is_atomic && !! site?.enabled_plugin_slugs?.find( ( value ) => value === 'jetpack' );

	if ( ! shouldShowUpsell ) {
		return (
			<>
				<UpsellProductCard
					featureType={ FEATURE_TYPE_JETPACK_STATS }
					nonManageProductSlug={ PRODUCT_JETPACK_STATS_MONTHLY }
					siteId={ null }
					onCtaButtonClick={ () => {} }
				/>
			</>
		);
	}

	return (
		<>
			<DocumentHead title="Stats" />
			<div className="site-preview-pane__stats-content">
				<InsightsStats
					stats={ site.site_stats }
					siteUrlWithScheme={ site.url_with_scheme }
					trackEvent={ trackEvent }
				/>
			</div>
			<ItemPreviewPaneFooter />
		</>
	);
}
