import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { PluginPrice } from 'calypso/my-sites/plugins/plugin-price';
import usePreinstalledPremiumPlugin from '../use-preinstalled-premium-plugin';

export default function PreinstalledPremiumPluginBrowserItemPricing( { plugin } ) {
	const translate = useTranslate();

	const { isPreinstalledPremiumPluginActive, isPreinstalledPremiumPluginUpgraded } =
		usePreinstalledPremiumPlugin( plugin.slug );

	if ( isPreinstalledPremiumPluginUpgraded ) {
		const checkmarkColorClass = isPreinstalledPremiumPluginActive
			? 'checkmark--active'
			: 'checkmark--inactive';
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="plugins-browser-item__installed-and-active-container">
				<div className="plugins-browser-item__installed ">
					<Gridicon icon="checkmark" className={ checkmarkColorClass } size={ 14 } />
					{ translate( 'Installed' ) }
				</div>
				<div className="plugins-browser-item__active">
					<Badge type={ isPreinstalledPremiumPluginActive ? 'success' : 'info' }>
						{ isPreinstalledPremiumPluginActive ? translate( 'Active' ) : translate( 'Inactive' ) }
					</Badge>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}

	return (
		<div className="plugins-browser-item__pricing">
			<PluginPrice plugin={ plugin } billingPeriod={ IntervalLength.MONTHLY }>
				{ ( { isFetching, price, period } ) =>
					isFetching ? (
						<div className="plugins-browser-item__pricing-placeholder">...</div>
					) : (
						translate( '{{span}}From{{/span}} %(price)s {{span}}%(period)s{{/span}}', {
							args: { price, period },
							components: { span: <span className="plugins-browser-item__period" /> },
							comment:
								'`price` already includes the currency symbol; `period` can be monthly or yearly. Example: "From $100 monthly"',
						} )
					)
				}
			</PluginPrice>
		</div>
	);
}
