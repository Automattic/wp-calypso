import { sortByMenuOrder } from '../utils';
import Bundle from './bundle';
import type { MenuItem } from 'calypso/data/jetpack/use-jetpack-masterbar-data-query';
import type { FC } from 'react';

interface BundlesSectionProps {
	bundles: MenuItem | null;
}

const BundlesSection: FC< BundlesSectionProps > = ( { bundles } ) => {
	if ( ! bundles || Array( bundles.items ).length < 1 ) {
		return null;
	}

	return (
		<div className="header__submenu-bottom-section">
			<div className="header__submenu-bundles">
				<p className="header__submenu-category-heading">{ bundles.label }</p>

				<ul className="header__submenu-links-list">
					{ bundles &&
						Array.from( Object.values( bundles.items ) )
							.sort( sortByMenuOrder )
							.map( ( { id, label, href } ) => (
								<Bundle key={ `bundles-${ href }-${ label }` } bundle={ { id, label, href } } />
							) ) }
				</ul>
			</div>
		</div>
	);
};

export default BundlesSection;
