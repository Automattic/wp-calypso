import classNames from 'classnames';
import useJetpackMasterbarDataQuery from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import { trailingslashit } from 'calypso/lib/route';
import { sortByMenuOrder, isValidLink } from '../utils';
import MainMenuItem from './main-menu-item';
import type { FC } from 'react';

interface MenuItemsProps {
	pathname: string | undefined;
}

const MenuItems: FC< MenuItemsProps > = ( { pathname } ) => {
	const { data: menuData, status: menuDataStatus } = useJetpackMasterbarDataQuery();

	const sections = menuData?.sections ? Array.from( Object.values( menuData.sections ) ) : null;
	const bundles = menuData?.bundles ?? null;

	return (
		<ul className="header__sections-list js-nav-list">
			{ menuDataStatus === 'success' && sections ? (
				sections.sort( sortByMenuOrder ).map( ( section ) => {
					const { label, href } = section;

					return (
						<li
							className={ classNames( {
								'is-active':
									pathname &&
									isValidLink( href ) &&
									new URL( trailingslashit( href ) ).pathname === trailingslashit( pathname ),
							} ) }
							key={ `main-menu-${ href }${ label }` }
						>
							<MainMenuItem section={ section } bundles={ bundles } />
						</li>
					);
				} )
			) : (
				<></>
			) }
		</ul>
	);
};

export default MenuItems;
