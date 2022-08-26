import { useTranslate } from 'i18n-calypso';
import { MostPopular } from './most-popular';
import { SeeAllFeatures } from './see-all-features';
import type { ItemsListProps } from './types';

export const ItemsList: React.FC< ItemsListProps > = ( { currentView } ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-product-store__items-list">
			{ currentView === 'products' && (
				<div>
					<MostPopular heading={ translate( 'Most popular products' ) } items={ <></> } />
				</div>
			) }
			{ currentView === 'bundles' && (
				<div>
					<MostPopular heading={ translate( 'Most popular bundles' ) } items={ <></> } />
					<SeeAllFeatures />
				</div>
			) }
		</div>
	);
};
