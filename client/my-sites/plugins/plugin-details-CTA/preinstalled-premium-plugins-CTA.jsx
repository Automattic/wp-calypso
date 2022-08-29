import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import BillingIntervalSwitcher from 'calypso/my-sites/marketplace/components/billing-interval-switcher';
import { setBillingInterval } from 'calypso/state/marketplace/billing-interval/actions';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { PluginPrice } from '../plugin-price';
import PreinstalledPremiumPluginPriceDisplay from '../plugin-price/preinstalled-premium-plugin-price-display';
import usePreinstalledPremiumPlugin from '../use-preinstalled-premium-plugin';
import CTAButton from './CTA-button';

export default function PluginDetailsCTAPreinstalledPremiumPlugins( {
	isPluginInstalledOnsite,
	plugin,
} ) {
	const legacyVersion = ! config.isEnabled( 'plugins/plugin-details-layout' );
	const dispatch = useDispatch();
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSiteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSiteId ) );
	const isJetpackSelfHosted = selectedSiteId && isJetpack && ! isAtomic;
	const isSimple = selectedSiteId && ! isAtomic && ! isJetpack;
	const isSiteConnected = useSelector( ( state ) =>
		getSiteConnectionStatus( state, selectedSiteId )
	);

	const billingPeriod = useSelector( getBillingInterval );
	const { isPreinstalledPremiumPluginUpgraded, preinstalledPremiumPluginProduct } =
		usePreinstalledPremiumPlugin( plugin.slug );

	const managedPluginMessage = (
		<span className="plugin-details-cta__preinstalled">
			{ translate( '%s is automatically managed for you.', { args: plugin.name } ) }
		</span>
	);
	const pluginPrice = (
		<>
			<div className="plugin-details-cta__price">
				<PluginPrice plugin={ plugin } billingPeriod={ billingPeriod }>
					{ ( { isFetching, price, period } ) =>
						isFetching ? (
							<div className="plugin-details-cta__price-placeholder">...</div>
						) : (
							<PreinstalledPremiumPluginPriceDisplay
								className="plugin-details-cta__period"
								period={ period }
								pluginSlug={ plugin.slug }
								price={ price }
							/>
						)
					}
				</PluginPrice>
			</div>
			{ ! legacyVersion && (
				<BillingIntervalSwitcher
					billingPeriod={ billingPeriod }
					onChange={ ( interval ) => dispatch( setBillingInterval( interval ) ) }
					plugin={ plugin }
				/>
			) }
		</>
	);

	const upgradeButton = (
		<div className="plugin-details-cta__install">
			<Button
				className="plugin-details-cta__install-button"
				href={ `/checkout/${ selectedSiteSlug }/${ preinstalledPremiumPluginProduct }` }
				primary
			>
				{ translate( 'Upgrade %s', { args: plugin.name } ) }
			</Button>
		</div>
	);
	const activateButton = (
		<div className="plugin-details-cta__install">
			<CTAButton
				billingPeriod={ billingPeriod }
				isJetpackSelfHosted={ isJetpackSelfHosted }
				isSiteConnected={ isSiteConnected }
				plugin={ plugin }
				selectedSite={ selectedSite }
			/>
		</div>
	);

	if ( isSimple && isPreinstalledPremiumPluginUpgraded ) {
		return managedPluginMessage;
	}
	if ( isSimple && ! isPreinstalledPremiumPluginUpgraded ) {
		return (
			<>
				{ pluginPrice }
				{ managedPluginMessage }
				{ upgradeButton }
			</>
		);
	}

	if ( ! isSimple && ! isPluginInstalledOnsite && ! isPreinstalledPremiumPluginUpgraded ) {
		return (
			<>
				{ pluginPrice }
				{ activateButton }
			</>
		);
	}

	if ( ! isSimple && isPluginInstalledOnsite && ! isPreinstalledPremiumPluginUpgraded ) {
		return (
			<>
				{ pluginPrice }
				{ upgradeButton }
			</>
		);
	}

	return null;
}
