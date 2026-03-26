import { isEnabled } from '@automattic/calypso-config';
import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import HeaderBar from '../components/header-bar';
import PluginsMenu from './plugins-menu';

export default function Plugins() {
	return (
		<>
			{ ! isEnabled( 'dashboard/omnibar' ) && (
				<HeaderBar>
					<HStack spacing={ 3 }>
						<HeaderBar.Title>
							<span>{ __( 'Plugins' ) }</span>
						</HeaderBar.Title>
						<PluginsMenu />
					</HStack>
				</HeaderBar>
			) }
			<Outlet />
		</>
	);
}
