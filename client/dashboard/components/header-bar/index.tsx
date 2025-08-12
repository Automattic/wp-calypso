import { __experimentalHStack as HStack } from '@wordpress/components';
import './style.scss';

function Header( { as = 'div', children }: { as?: 'div' | 'header'; children?: React.ReactNode } ) {
	return (
		<HStack
			as={ as }
			className="dashboard-header-bar"
			alignment="left"
			spacing={ 2 }
			justify="flex-start"
		>
			{ children }
		</HStack>
	);
}

Header.Title = function HeaderBarTitle( { children }: { children: React.ReactNode } ) {
	return (
		<HStack
			style={ { width: 'auto', flexGrow: 1, flexShrink: 0 } }
			className="dashboard-header-bar-title"
		>
			{ children }
		</HStack>
	);
};

export default Header;
