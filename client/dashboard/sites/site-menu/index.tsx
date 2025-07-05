import { __ } from '@wordpress/i18n';
import ResponsiveMenu from '../../components/responsive-menu';
import type { Site } from '../../data/types';

const SiteMenu = ( { site }: { site: Site } ) => {
	const siteSlug = site.slug;

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
			{ site.capabilities.manage_options && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/settings` }>
					{ __( 'Settings' ) }
				</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default SiteMenu;
