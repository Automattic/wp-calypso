import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useBundlesToDisplay } from '../hooks/use-bundles-to-display';
import { SeeAllFeatures } from '../see-all-features';
import { AllItems } from './all-items';
import { MostPopular } from './most-popular';
import type { BundlesListProps } from '../types';

export const BundlesList: React.FC< BundlesListProps > = ( {
	createCheckoutURL,
	duration,
	onClickPurchase,
	onClickMoreInfoFactory,
	siteId,
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
				createCheckoutURL={ createCheckoutURL }
				duration={ duration }
				heading={ translate( 'Most popular bundles' ) }
				items={ popularItems }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
				onClickPurchase={ onClickPurchase }
				siteId={ siteId }
			/>

			<SeeAllFeatures />

			{ /* Show All items only if there is something in otherItems */ }
			{ otherItems.length ? (
				<AllItems
					createCheckoutURL={ createCheckoutURL }
					duration={ duration }
					heading={ translate( 'All bundles' ) }
					items={ allItems }
					onClickMoreInfoFactory={ onClickMoreInfoFactory }
					onClickPurchase={ onClickPurchase }
					siteId={ siteId }
				/>
			) : null }
		</div>
	);
};
