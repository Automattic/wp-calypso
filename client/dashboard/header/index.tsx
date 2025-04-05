import HeaderBar from '../header-bar';
import Logo from '../logo';
import MainMenu from '../main-menu';
import SecondaryMenu from '../secondary-menu';

function Header() {
	return (
		<HeaderBar as="header">
			<div>
				<Logo />
			</div>
			<div style={ { flexGrow: 1 } }>
				<MainMenu />
			</div>
			<div>
				<SecondaryMenu />
			</div>
		</HeaderBar>
	);
}

export default Header;
