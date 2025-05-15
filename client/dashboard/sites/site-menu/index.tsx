import { __ } from '@wordpress/i18n';
import {
	siteDeploymentsRoute,
	siteSettingsRoute,
	sitePerformanceRoute,
	siteOverviewRoute,
} from '../../app/router';
import ResponsiveMenu from '../../components/responsive-menu';

const SiteMenu = () => {
	return (
		<ResponsiveMenu label={ __( 'Site Menu' ) }>
			<ResponsiveMenu.Item to={ siteOverviewRoute.to } activeOptions={ { exact: true } }>
				{ siteOverviewRoute.options.staticData.label() }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ siteDeploymentsRoute.to }>
				{ siteDeploymentsRoute.options.staticData.label() }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ sitePerformanceRoute.to }>
				{ sitePerformanceRoute.options.staticData.label() }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ siteSettingsRoute.to }>
				{ siteSettingsRoute.options.staticData.label() }
			</ResponsiveMenu.Item>
		</ResponsiveMenu>
	);
};

export default SiteMenu;
