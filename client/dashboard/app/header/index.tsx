import { useViewportMatch } from '@wordpress/compose';
import HeaderBar from '../../components/header-bar';
import RouterLinkButton from '../../components/router-link-button';
import { useAppContext } from '../context';
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
					<RouterLinkButton icon={ <Logo /> } to="/" />
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
