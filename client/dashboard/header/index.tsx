import { useAppContext } from '../app/context';
import HeaderBar from '../header-bar';
import LogoDotcom from '../logo';
import LogoA4A from '../logo/a4a';
import MainMenu from '../main-menu';
import SecondaryMenu from '../secondary-menu';

function Header() {
	const { appType } = useAppContext();
	return (
		<HeaderBar as="header">
			<div>{ appType === 'dotcom' && <LogoDotcom /> }</div>
			<div>{ appType === 'a4a' && <LogoA4A /> }</div>
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
