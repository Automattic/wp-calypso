import { __ } from '@wordpress/i18n';
import Menu from '../menu';

const SiteMenu = ( { siteId }: { siteId: string } ) => {
	return (
		<Menu>
			<Menu.Item to={ `/sites/${ siteId }` }>{ __( 'Overview' ) }</Menu.Item>
			<Menu.Item to={ `/sites/${ siteId }/deployments` }>{ __( 'Deployments' ) }</Menu.Item>
		</Menu>
	);
};

export default SiteMenu;
