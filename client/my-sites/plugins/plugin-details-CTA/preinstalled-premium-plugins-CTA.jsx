import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import BillingIntervalSwitcher from 'calypso/my-sites/marketplace/components/billing-interval-switcher';
import { setBillingInterval } from 'calypso/state/marketplace/billing-interval/actions';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { PREINSTALLED_PREMIUM_PLUGINS } from '../constants';
import { getPeriodVariationValue, PluginPrice } from '../plugin-price';
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
	const { feature: pluginFeature, products: pluginProducts } =
		PREINSTALLED_PREMIUM_PLUGINS[ plugin.slug ];
	const pluginProduct = pluginProducts[ getPeriodVariationValue( billingPeriod ) ];

	const hasFeature = useSelector( ( state ) =>
		siteHasFeature( state, selectedSiteId, pluginFeature )
	);

	const managedPluginMessage = (
		<span className="plugin-details-CTA__preinstalled">
			{ translate( '%s is automatically managed for you.', { args: plugin.name } ) }
		</span>
	);
	const pluginPrice = (
		<>
			<div className="plugin-details-CTA__price">
				<PluginPrice plugin={ plugin } billingPeriod={ billingPeriod }>
					{ ( { isFetching, price, period } ) =>
						isFetching ? (
							<div className="plugin-details-CTA__price-placeholder">...</div>
						) : (
							<>
								{ price + ' ' }
								<span className="plugin-details-CTA__period">{ period }</span>
							</>
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
		<div className="plugin-details-CTA__install">
			<Button
				className="plugin-details-CTA__install-button"
				href={ `/checkout/${ selectedSiteSlug }/${ pluginProduct }` }
				primary
			>
				{ translate( 'Upgrade %s', { args: plugin.name } ) }
			</Button>
		</div>
	);
	const activateButton = (
		<div className="plugin-details-CTA__install">
			<CTAButton
				billingPeriod={ billingPeriod }
				isJetpackSelfHosted={ isJetpackSelfHosted }
				isSiteConnected={ isSiteConnected }
				plugin={ plugin }
				selectedSite={ selectedSite }
			/>
		</div>
	);

	if ( isSimple && hasFeature ) {
		return managedPluginMessage;
	}
	if ( isSimple && ! hasFeature ) {
		return (
			<>
				{ pluginPrice }
				{ managedPluginMessage }
				{ upgradeButton }
			</>
		);
	}

	if ( ! isSimple && ! isPluginInstalledOnsite ) {
		return (
			<>
				{ pluginPrice }
				{ activateButton }
			</>
		);
	}

	if ( ! isSimple && isPluginInstalledOnsite && ! hasFeature ) {
		return (
			<>
				{ pluginPrice }
				{ upgradeButton }
			</>
		);
	}

	return null;
}
