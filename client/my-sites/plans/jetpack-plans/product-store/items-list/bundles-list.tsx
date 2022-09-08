import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useBundlesToDisplay } from '../hooks/use-bundles-to-display';
import { SeeAllFeatures } from '../see-all-features';
import { AllItems } from './all-items';
import { MostPopular } from './most-popular';
import type { BundlesListProps } from '../types';

import './style-bundle-list.scss';

export const BundlesList: React.FC< BundlesListProps > = ( {
	onClickMoreInfoFactory,
	siteId,
	duration,
} ) => {
	const [ popularItems, otherItems ] = useBundlesToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const allItems = useMemo(
		() => [ ...popularItems, ...otherItems ],
		[ otherItems, popularItems ]
	);

	return (
		<div className="jetpack-product-store__bundles-list">
			<MostPopular
				heading={ translate( 'Most popular bundles' ) }
				items={ popularItems }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
				siteId={ siteId }
			/>

			<SeeAllFeatures />

			{ /* Show All items only if there is something in otherItems */ }
			{ otherItems.length ? (
				<AllItems
					heading={ translate( 'All bundles' ) }
					items={ allItems }
					onClickMoreInfoFactory={ onClickMoreInfoFactory }
					siteId={ siteId }
				/>
			) : null }
		</div>
	);
};
