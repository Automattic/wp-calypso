import config from '@automattic/calypso-config';
import {
	isFreePlanProduct,
	FEATURE_INSTALL_PLUGINS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import './style.scss';
import eye from 'calypso/assets/images/marketplace/eye.svg';
import support from 'calypso/assets/images/marketplace/support.svg';
import wooLogo from 'calypso/assets/images/marketplace/woo-logo.svg';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import { PlanUSPS, USPS } from 'calypso/my-sites/plugins/plugin-details-CTA/usps';
import PluginDetailsSidebarUSP from 'calypso/my-sites/plugins/plugin-details-sidebar-usp';
import usePluginsSupportText from 'calypso/my-sites/plugins/use-plugins-support-text/';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PluginDetailsSidebar = ( {
	plugin: {
		active_installs,
		tested,
		isMarketplaceProduct = false,
		demo_url = null,
		documentation_url = null,
		requirements = {},
	},
} ) => {
	const translate = useTranslate();

	const legacyVersion = ! config.isEnabled( 'plugins/plugin-details-layout' );

	const selectedSite = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;
	const billingPeriod = useSelector( getBillingInterval );
	const isFreePlan = selectedSite && isFreePlanProduct( selectedSite.plan );
	const pluginFeature = isMarketplaceProduct
		? WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
		: FEATURE_INSTALL_PLUGINS;
	const shouldUpgrade =
		useSelector( ( state ) => ! siteHasFeature( state, selectedSite?.ID, pluginFeature ) ) &&
		! isJetpackSelfHosted;

	const isWooCommercePluginRequired = requirements.plugins?.some(
		( pluginName ) => pluginName === 'plugins/woocommerce'
	);

	const supportText = usePluginsSupportText();

	const supportLinks = [
		{
			href: 'https://wordpress.com/support/help-support-options/#live-chat-support',
			label: translate( 'How to get help!' ),
		},
		{ href: 'https://automattic.com/privacy/', label: translate( 'See privacy policy' ) },
	];
	documentation_url &&
		supportLinks.unshift( {
			href: documentation_url,
			label: translate( 'View documentation' ),
		} );

	if ( legacyVersion && ! isMarketplaceProduct ) {
		return (
			<>
				<div className="plugin-details-sidebar__plugin-details-title">
					{ translate( 'Plugin details' ) }
				</div>
				<div className="plugin-details-sidebar__plugin-details-content">
					{ Boolean( active_installs ) && (
						<div className="plugin-details-sidebar__active-installs">
							<div className="plugin-details-sidebar__active-installs-text title">
								{ translate( 'Active installations' ) }
							</div>
							<div className="plugin-details-sidebar__active-installs-value value">
								{ formatNumberMetric( active_installs, 0 ) }
							</div>
						</div>
					) }
					{ Boolean( tested ) && (
						<div className="plugin-details-sidebar__tested">
							<div className="plugin-details-sidebar__tested-text title">
								{ translate( 'Tested up to' ) }
							</div>
							<div className="plugin-details-sidebar__tested-value value">{ tested }</div>
						</div>
					) }
				</div>
			</>
		);
	}

	return (
		<div className="plugin-details-sidebar__plugin-details-content">
			{ isWooCommercePluginRequired && (
				<PluginDetailsSidebarUSP
					id="woo"
					icon={ legacyVersion && { src: wooLogo } }
					title={ translate( 'Your store foundations' ) }
					description={ translate(
						'This plugin requires the WooCommerce plugin to work.{{br/}}If you do not have it installed, it will be installed automatically for free.',
						{
							components: {
								br: <br />,
							},
						}
					) }
					first
				/>
			) }

			{ ! legacyVersion && selectedSite && (
				<USPS
					shouldUpgrade={ shouldUpgrade }
					isFreePlan={ isFreePlan }
					isMarketplaceProduct={ isMarketplaceProduct }
					billingPeriod={ billingPeriod }
				/>
			) }

			{ ! legacyVersion && selectedSite && (
				<PlanUSPS
					shouldUpgrade={ shouldUpgrade }
					isFreePlan={ isFreePlan }
					isMarketplaceProduct={ isMarketplaceProduct }
					billingPeriod={ billingPeriod }
				/>
			) }

			{ demo_url && (
				<PluginDetailsSidebarUSP
					id="demo"
					icon={ legacyVersion && { src: eye } }
					title={ translate( 'Try it before you buy it' ) }
					description={ translate(
						'Take a look at the posibilities of this plugin before your commit.'
					) }
					links={ [ { href: { demo_url }, label: translate( 'View live demo' ) } ] }
					first={ ! isWooCommercePluginRequired || ! legacyVersion }
				/>
			) }

			{ isMarketplaceProduct && (
				<PluginDetailsSidebarUSP
					id="support"
					icon={ legacyVersion && { src: support } }
					title={ translate( 'Support' ) }
					description={ supportText }
					links={ supportLinks }
					first={ ( ! isWooCommercePluginRequired && ! demo_url ) || ! legacyVersion }
				/>
			) }

			{ Boolean( active_installs ) && (
				<div className="plugin-details-sidebar__active-installs">
					<div className="plugin-details-sidebar__active-installs-text title">
						{ translate( 'Active installations' ) }
					</div>
					<div className="plugin-details-sidebar__active-installs-value value">
						{ formatNumberMetric( active_installs, 0 ) }
					</div>
				</div>
			) }
			{ Boolean( tested ) && (
				<div className="plugin-details-sidebar__tested">
					<div className="plugin-details-sidebar__tested-text title">
						{ translate( 'Tested up to' ) }
					</div>
					<div className="plugin-details-sidebar__tested-value value">{ tested }</div>
				</div>
			) }
		</div>
	);
};

export default PluginDetailsSidebar;
