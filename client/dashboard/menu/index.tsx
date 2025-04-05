import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import clsx from 'clsx';
import { useHref, useLinkClickHandler, useMatch } from 'react-router-dom';
import './style.scss';

function MenuItem( { to, children }: { to: string; children: React.ReactNode } ) {
	const handleClick = useLinkClickHandler( to );
	const href = useHref( to );
	const match = useMatch( to );

	return (
		<Button
			className={ clsx( 'dashboard-menu__item', {
				'is-active': match,
			} ) }
			variant="tertiary"
			href={ href }
			onClick={ handleClick }
			__next40pxDefaultSize
		>
			{ children }
		</Button>
	);
}

function Menu( { children }: { children: React.ReactNode } ) {
	return (
		<HStack className="dashboard-menu" spacing={ 2 } justify="flex-start">
			{ children }
		</HStack>
	);
}

Menu.Item = MenuItem;

export default Menu;
