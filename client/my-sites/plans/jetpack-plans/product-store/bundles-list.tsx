import { useTranslate } from 'i18n-calypso';
import { useBundlesToDisplay } from './hooks/use-bundles-to-display';
import { MostPopular } from './most-popular';
import { SeeAllFeatures } from './see-all-features';
import type { BundlesListProps } from './types';

export const BundlesList: React.FC< BundlesListProps > = ( { duration, siteId } ) => {
	const [ popularItems ] = useBundlesToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const mostPopularItems = popularItems.map( ( item ) => {
		// TODO relace this with popular product card
		return <div key={ item.productSlug }>{ item.displayName }</div>;
	} );

	return (
		<div className="jetpack-product-store__bundles-list">
			<MostPopular heading={ translate( 'Most popular bundles' ) } items={ mostPopularItems } />
			<SeeAllFeatures />
		</div>
	);
};
