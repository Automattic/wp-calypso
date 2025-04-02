import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useHref, useLinkClickHandler, useMatch } from 'react-router-dom';
import './style.scss';

function MenuItem( { to, children }: { to: string; children: React.ReactNode } ) {
	const handleClick = useLinkClickHandler( to );
	const href = useHref( to );
	const match = useMatch( to );

	return (
		<Button
			className={ clsx( 'dashboard-main-menu__item', {
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

function MainMenu() {
	return (
		<HStack className="dashboard-main-menu" spacing={ 2 } justify="flex-start">
			<MenuItem to="/sites">{ __( 'Sites' ) }</MenuItem>
			<MenuItem to="/domains">{ __( 'Domains' ) }</MenuItem>
		</HStack>
	);
}

export default MainMenu;
