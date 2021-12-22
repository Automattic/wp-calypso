import { useTranslate } from 'i18n-calypso';
import './style.scss';
import eye from 'calypso/assets/images/marketplace/eye.svg';
import support from 'calypso/assets/images/marketplace/support.svg';
import wooLogo from 'calypso/assets/images/marketplace/woo-logo.svg';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import PluginDetailsSidebarUSP from 'calypso/my-sites/plugins/plugin-details-sidebar-usp';

const PluginDetailsSidebar = ( {
	plugin: { active_installs, tested, isMarketplaceProduct = true }, // Needs to correctly pass isMarketplaceProduct in parent component
} ) => {
	const translate = useTranslate();

	return (
		<>
			<div className="plugin-details-sidebar__plugin-details-title">
				{ translate( 'Plugin details' ) }
			</div>
			<div className="plugin-details-sidebar__plugin-details-content">
				{ /* Needs to check for woocommerce dependencies */ }
				{ isMarketplaceProduct && (
					<PluginDetailsSidebarUSP
						icon={ { src: wooLogo, width: '32px' } }
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
				{ /* Needs to check for demo_url */ }
				{ isMarketplaceProduct && (
					<PluginDetailsSidebarUSP
						icon={ { src: eye, width: '24px' } }
						title={ translate( 'Try it before you buy it' ) }
						description={ translate(
							'Take a look at the posibilities of this plugin before your commit.'
						) }
						links={ [ { href: 'demo', label: translate( 'View live demo' ) } ] }
					/>
				) }
				{ /* Needs to check for documentation_url */ }
				{ isMarketplaceProduct && (
					<PluginDetailsSidebarUSP
						icon={ { src: support, width: '24px' } }
						title={ translate( 'Support' ) }
						description={ translate( 'Handled by WooCommerce.' ) }
						last
						links={ [
							{ href: 'docs', label: translate( 'View documentation' ) },
							{ href: 'https://automattic.com/privacy/', label: translate( 'See privacy policy' ) },
						] }
					/>
				) }
				{ ! isMarketplaceProduct && Boolean( active_installs ) && (
					<div className="plugin-details-sidebar__active-installs">
						<div className="plugin-details-sidebar__active-installs-text title">
							{ translate( 'Active installations' ) }
						</div>
						<div className="plugin-details-sidebar__active-installs-value value">
							{ formatNumberMetric( active_installs, 'en' ) }
						</div>
					</div>
				) }
				{ ! isMarketplaceProduct && Boolean( tested ) && (
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
};

export default PluginDetailsSidebar;
