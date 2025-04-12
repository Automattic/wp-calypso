import { useNavigate, useMatchRoute, useRouter } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import clsx from 'clsx';
import './style.scss';

function MenuItem( { to, children }: { to: string; children: React.ReactNode } ) {
	const navigate = useNavigate();
	const matchRoute = useMatchRoute();
	const isActive = matchRoute( { to } );
	const router = useRouter();
	const href = router.buildLocation( {
		to,
	} ).href;
	const handleClick = ( e: React.MouseEvent ) => {
		e.preventDefault();
		navigate( { to } );
	};

	return (
		<Button
			className={ clsx( 'dashboard-menu__item', {
				'is-active': isActive,
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
