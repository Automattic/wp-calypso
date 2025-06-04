import { __ } from '@wordpress/i18n';
import ResponsiveMenu from '../../components/responsive-menu';

export interface SiteMenuConfig {
	hide?: {
		settings?: boolean;
	};
}

const SiteMenu = ( { siteSlug, config }: { siteSlug: string; config?: SiteMenuConfig } ) => {
	const { hide = {} } = config ?? {};

	return (
		<ResponsiveMenu label={ __( 'Site Menu' ) }>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }` } activeOptions={ { exact: true } }>
				{ __( 'Overview' ) }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/deployments` }>
				{ __( 'Deployments' ) }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/performance` }>
				{ __( 'Performance' ) }
			</ResponsiveMenu.Item>
			{ ! hide.settings && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/settings` }>
					{ __( 'Settings' ) }
				</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default SiteMenu;
