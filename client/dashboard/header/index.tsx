import { __experimentalHStack as HStack } from '@wordpress/components';
import Logo from '../logo';
import MainMenu from '../main-menu';
import SecondaryMenu from '../secondary-menu';
import './style.scss';

function Header() {
	return (
		<HStack
			as="header"
			className="dashboard-header"
			alignment="left"
			spacing={ 10 }
			justify="flex-start"
		>
			<div>
				<Logo />
			</div>
			<div style={ { flexGrow: 1 } }>
				<MainMenu />
			</div>
			<div>
				<SecondaryMenu />
			</div>
		</HStack>
	);
}

export default Header;
