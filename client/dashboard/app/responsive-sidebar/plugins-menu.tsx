import { __ } from '@wordpress/i18n';
import { plugins } from '@wordpress/icons';
import { SidebarExpandableMenuItem, SidebarMenuItem } from '../../components/sidebar';
import {
	PLUGINS_MANAGE_PATH,
	PLUGINS_PATH,
	PLUGINS_SCHEDULED_UPDATES_PATH,
} from '../../plugins/paths';
import { wpcomLink } from '../../utils/link';

export default function PluginsMenu() {
	return (
		<SidebarExpandableMenuItem label={ __( 'Plugins' ) } icon={ plugins } to={ PLUGINS_PATH }>
			<SidebarMenuItem to={ PLUGINS_MANAGE_PATH }>{ __( 'Manage plugins' ) }</SidebarMenuItem>
			<SidebarMenuItem to={ PLUGINS_SCHEDULED_UPDATES_PATH }>
				{ __( 'Scheduled updates' ) }
			</SidebarMenuItem>
			<SidebarMenuItem href={ wpcomLink( '/plugins' ) }>{ __( 'Browse plugins' ) }</SidebarMenuItem>
		</SidebarExpandableMenuItem>
	);
}
