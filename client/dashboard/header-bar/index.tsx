import { __experimentalHStack as HStack } from '@wordpress/components';
import { useAppContext } from '../app-context';
import './style.scss';

function Header( { as = 'div', children }: { as?: 'div' | 'header'; children?: React.ReactNode } ) {
	const { appType } = useAppContext();
	const className = `dashboard-header-bar dashboard-header-bar__${ appType }`;
	return (
		<HStack as={ as } className={ className } alignment="left" spacing={ 10 } justify="flex-start">
			{ children }
		</HStack>
	);
}

export default Header;
