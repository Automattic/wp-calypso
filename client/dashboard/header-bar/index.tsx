import { __experimentalHStack as HStack } from '@wordpress/components';
import './style.scss';

function Header( { as = 'div', children }: { as?: 'div' | 'header'; children?: React.ReactNode } ) {
	return (
		<HStack
			as={ as }
			className="dashboard-header-bar"
			alignment="left"
			spacing={ 10 }
			justify="flex-start"
		>
			{ children }
		</HStack>
	);
}

export default Header;
