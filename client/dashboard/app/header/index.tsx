import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import HeaderBar from '../../components/header-bar';
import SecondaryMenu from '../secondary-menu';

function Header( { onOpenMenu, isMenuOpen }: { onOpenMenu?: () => void; isMenuOpen?: boolean } ) {
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HeaderBar as="header">
			{ ! isDesktop && ! isMenuOpen && (
				<Button icon={ menu } label={ __( 'Menu' ) } onClick={ onOpenMenu } />
			) }

			<div style={ { flexGrow: 1 } } />
			<div style={ { flexShrink: 0 } }>
				<SecondaryMenu />
			</div>
		</HeaderBar>
	);
}

export default Header;
