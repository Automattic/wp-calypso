import { useTranslate } from 'i18n-calypso';
import './style.scss';
import { useSelector } from 'react-redux';
import eye from 'calypso/assets/images/marketplace/eye.svg';
import support from 'calypso/assets/images/marketplace/support.svg';
import wooLogo from 'calypso/assets/images/marketplace/woo-logo.svg';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import PluginDetailsSidebarUSP from 'calypso/my-sites/plugins/plugin-details-sidebar-usp';
import { isAnnualPlanOrUpgradeableAnnualPeriod } from 'calypso/state/marketplace/selectors';

const PluginDetailsSidebar = ( {
	plugin: {
		active_installs,
		tested,
		isMarketplaceProduct = false,
		demo_url = null,
		documentation_url = null,
	},
} ) => {
	const translate = useTranslate();

	const isAnnualPlan = useSelector( isAnnualPlanOrUpgradeableAnnualPeriod );

	if ( ! isMarketplaceProduct ) {
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
	const supportLinks = [
		{
			href: 'https://wordpress.com/support/help-support-options/#live-chat-support',
			label: translate( 'How to get help!' ),
		},
		{ href: 'https://automattic.com/privacy/', label: translate( 'See privacy policy' ) },
	];
	documentation_url &&
		supportLinks.unshift( {
			href: { documentation_url },
			label: translate( 'View documentation' ),
		} );

	return (
		<div className="plugin-details-sidebar__plugin-details-content">
			<PluginDetailsSidebarUSP
				id="woo"
				icon={ { src: wooLogo } }
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
			{ demo_url && (
				<PluginDetailsSidebarUSP
					id="demo"
					icon={ { src: eye } }
					title={ translate( 'Try it before you buy it' ) }
					description={ translate(
						'Take a look at the posibilities of this plugin before your commit.'
					) }
					links={ [ { href: { demo_url }, label: translate( 'View live demo' ) } ] }
				/>
			) }

			<PluginDetailsSidebarUSP
				id="support"
				icon={ { src: support } }
				title={ translate( 'Support' ) }
				description={
					isAnnualPlan
						? translate( 'Live chat support 24x7' )
						: translate( 'Unlimited Email Support' )
				}
				links={ supportLinks }
			/>
		</div>
	);
};

export default PluginDetailsSidebar;
