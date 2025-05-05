import { __ } from '@wordpress/i18n';
import ResponsiveMenu from '../responsive-menu';

const SiteMenu = ( { siteSlug }: { siteSlug: string } ) => {
	return (
		<ResponsiveMenu label={ __( 'Site Menu' ) }>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }` }>{ __( 'Overview' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/deployments` }>
				{ __( 'Deployments' ) }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/performance` }>
				{ __( 'Performance' ) }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/settings` }>
				{ __( 'Settings' ) }
			</ResponsiveMenu.Item>
		</ResponsiveMenu>
	);
};

export default SiteMenu;
