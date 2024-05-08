import clsx from 'clsx';
import { useMemo } from 'react';
import useJetpackMasterbarDataQuery from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import { trailingslashit } from 'calypso/lib/route';
import { sortByMenuOrder, isValidLink } from '../utils';
import MainMenuItem from './main-menu-item';
import type { MenuItem } from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import type { FC } from 'react';

interface MenuItemsProps {
	pathname: string | undefined;
}

interface MenuItemProps {
	section: MenuItem;
	bundles: MenuItem | null;
	pathname: string | undefined;
}

const MenuItems: FC< MenuItemsProps > = ( { pathname } ) => {
	const { data: menuData, status: menuDataStatus } = useJetpackMasterbarDataQuery();

	const sections = menuData?.sections ? Object.values( menuData.sections ) : null;
	const bundles = menuData?.bundles ?? null;

	return (
		<ul className="header__sections-list js-nav-list">
			{ menuDataStatus === 'success' && sections ? (
				sections.sort( sortByMenuOrder ).map( ( section ) => {
					const { label, href } = section;

					return (
						<MenuItem
							key={ `main-menu-${ href }${ label }` }
							section={ section }
							bundles={ bundles }
							pathname={ pathname }
						/>
					);
				} )
			) : (
				<></>
			) }
		</ul>
	);
};

export default MenuItems;

const MenuItem: FC< MenuItemProps > = ( { section, bundles, pathname } ) => {
	const { label, href } = section;

	const isActive = useMemo( () => {
		return (
			pathname &&
			isValidLink( href ) &&
			new URL( trailingslashit( href ) ).pathname === trailingslashit( pathname )
		);
	}, [ href, pathname ] );

	return (
		<li
			className={ clsx( {
				'is-active': isActive,
			} ) }
			key={ `main-menu-${ href }${ label }` }
		>
			<MainMenuItem section={ section } bundles={ bundles } />
		</li>
	);
};
