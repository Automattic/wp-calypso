import { Outlet, createLazyRoute } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import HeaderBar from '../header-bar';
import MeMenu from '../me-menu';
import MenuDivider from '../menu-divider';

function Me() {
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<>
			<HeaderBar>
				<HStack justify={ isDesktop ? 'flex-start' : 'space-between' } spacing={ 4 }>
					<Button
						variant="tertiary"
						__next40pxDefaultSize
						style={ { flexShrink: 0, color: 'inherit' } }
					>
						{ __( 'Account' ) }
					</Button>
					{ isDesktop && <MenuDivider /> }
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
