import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import HeaderBar from '../components/header-bar';
import MenuDivider from '../components/menu-divider';
import MeMenu from './me-menu';

function Me() {
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<>
			<HeaderBar>
				<HStack justify={ isDesktop ? 'flex-start' : 'space-between' } spacing={ 4 }>
					<HeaderBar.Title>
						<span>{ __( 'Account' ) }</span>
					</HeaderBar.Title>
					{ isDesktop && <MenuDivider /> }
					<MeMenu />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Me;
