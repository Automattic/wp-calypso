import { useAppContext } from '../app/context';
import HeaderBar from '../header-bar';
import MainMenu from '../main-menu';
import SecondaryMenu from '../secondary-menu';

function Header() {
	const { Logo } = useAppContext();
	return (
		<HeaderBar as="header">
			{ Logo && (
				<div>
					<Logo />
				</div>
			) }
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
