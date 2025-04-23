import { useViewportMatch } from '@wordpress/compose';
import { useAppContext } from '../app/context';
import HeaderBar from '../header-bar';
import PrimaryMenu from '../primary-menu';
import PrimaryMenuMobile from '../primary-menu-mobile';
import SecondaryMenu from '../secondary-menu';

function Header() {
	const { Logo } = useAppContext();
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HeaderBar as="header">
			{ ! isDesktop && (
				<div>
					<PrimaryMenuMobile />
				</div>
			) }

			{ Logo && (
				<div style={ { display: 'flex', alignItems: 'center' } }>
					<Logo />
				</div>
			) }

			<div style={ { flexGrow: 1 } }>{ isDesktop && <PrimaryMenu /> }</div>

			<div>
				<SecondaryMenu />
			</div>
		</HeaderBar>
	);
}

export default Header;
