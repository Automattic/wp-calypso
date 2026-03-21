import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SidebarBackButton } from '../../components/sidebar';
import MeMenu from '../me-menu';

export default function MeSidebar() {
	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to="/">{ __( 'Back' ) }</SidebarBackButton>
			<MeMenu />
		</VStack>
	);
}
