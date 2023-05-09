import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Badge from 'calypso/components/badge';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { PluginPrice } from 'calypso/my-sites/plugins/plugin-price';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PreinstalledPremiumPluginPriceDisplay from '../plugin-price/preinstalled-premium-plugin-price-display';
import usePreinstalledPremiumPlugin from '../use-preinstalled-premium-plugin';

export default function PreinstalledPremiumPluginBrowserItemPricing( { plugin } ) {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const {
		isPreinstalledPremiumPluginActive,
		isPreinstalledPremiumPluginUpgraded,
		sitesWithPreinstalledPremiumPlugin,
	} = usePreinstalledPremiumPlugin( plugin.slug );
	const translate = useTranslate();

	if ( ! selectedSiteId && sitesWithPreinstalledPremiumPlugin > 0 ) {
		return (
			<div className="plugins-browser-item__installed-and-active-container">
				<div className="plugins-browser-item__installed ">
					<Gridicon icon="checkmark" className="checkmark" size={ 12 } />
					{ translate( 'Installed on %d site', 'Installed on %d sites', {
						args: [ sitesWithPreinstalledPremiumPlugin ],
						count: sitesWithPreinstalledPremiumPlugin,
					} ) }
				</div>
			</div>
		);
	}

	if ( isPreinstalledPremiumPluginUpgraded ) {
		return (
			<div className="plugins-browser-item__installed-and-active-container">
				<div className="plugins-browser-item__installed ">
					<Gridicon icon="checkmark" className="checkmark" size={ 12 } />
					{ translate( 'Installed' ) }
				</div>
				<div className="plugins-browser-item__active">
					<Badge type={ isPreinstalledPremiumPluginActive ? 'success' : 'info' }>
						{ isPreinstalledPremiumPluginActive ? translate( 'Active' ) : translate( 'Inactive' ) }
					</Badge>
				</div>
			</div>
		);
	}

	return (
		<div className="plugins-browser-item__pricing">
			<PluginPrice plugin={ plugin } billingPeriod={ IntervalLength.MONTHLY }>
				{ ( { isFetching, price, period } ) =>
					isFetching ? (
						<div className="plugins-browser-item__pricing-placeholder">...</div>
					) : (
						<PreinstalledPremiumPluginPriceDisplay
							className="plugins-browser-item__period"
							period={ period }
							pluginSlug={ plugin.slug }
							price={ price }
						/>
					)
				}
			</PluginPrice>
		</div>
	);
}
