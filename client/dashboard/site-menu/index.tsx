import { __ } from '@wordpress/i18n';
import ResponsiveMenu from '../responsive-menu';

const SiteMenu = ( { siteId }: { siteId: string } ) => {
	return (
		<ResponsiveMenu label={ __( 'Site Menu' ) }>
			<ResponsiveMenu.Item to={ `/sites/${ siteId }` }>{ __( 'Overview' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to={ `/sites/${ siteId }/deployments` }>
				{ __( 'Deployments' ) }
			</ResponsiveMenu.Item>
		</ResponsiveMenu>
	);
};

export default SiteMenu;
