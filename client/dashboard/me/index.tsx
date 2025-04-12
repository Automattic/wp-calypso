import { Outlet, createLazyRoute } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import HeaderBar from '../header-bar';
import MeMenu from '../me-menu';
import MenuDivider from '../menu-divider';

function Me() {
	return (
		<>
			<HeaderBar>
				<HStack justify="flex-start" spacing={ 4 }>
					<Button
						variant="tertiary"
						__next40pxDefaultSize
						style={ { flexShrink: 0, color: 'inherit' } }
					>
						{ __( 'Account' ) }
					</Button>
					<MenuDivider />
					<MeMenu />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export const Route = createLazyRoute( 'me' )( {
	component: Me,
} );
