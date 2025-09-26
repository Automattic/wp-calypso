import { isSupportUserSession } from '@automattic/calypso-support-session';
import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import './style.scss';

function Header( { as = 'div', children }: { as?: 'div' | 'header'; children?: React.ReactNode } ) {
	return (
		<HStack
			as={ as }
			className={ clsx( 'dashboard-header-bar', {
				// Only customize header for support "user" sessions because
				// "next" sessions already have a floating toolbar which acts
				// as visual indicator.
				'is-support-user-session': isSupportUserSession(),
			} ) }
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
			style={ { width: 'auto', flexShrink: 0 } }
			className="dashboard-header-bar-title"
			spacing={ 3 }
		>
			{ children }
		</HStack>
	);
};

export default Header;
