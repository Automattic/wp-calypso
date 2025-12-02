import { Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import HeaderBar from '../components/header-bar';
import MeMenu from './me-menu';

function Me() {
	return (
		<>
			<HeaderBar>
				<HStack spacing={ 3 }>
					<HeaderBar.Title>
						<span>{ __( 'Account' ) }</span>
					</HeaderBar.Title>
					<MeMenu />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Me;
