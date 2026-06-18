import { UniversalNavbarHeader, type HeaderProps } from '@automattic/wpcom-template-parts';
import clsx from 'clsx';
import { useNav2026Props } from 'calypso/layout/use-nav-2026-props';

export function Nav2026UniversalHeader( { className, variant, ...headerProps }: HeaderProps ) {
	const nav2026Props = useNav2026Props( { variant } );

	return (
		<UniversalNavbarHeader
			{ ...headerProps }
			{ ...nav2026Props }
			variant={ variant }
			className={ clsx( className, nav2026Props.className ) }
		/>
	);
}
