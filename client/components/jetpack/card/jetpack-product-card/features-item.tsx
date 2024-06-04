import clsx from 'clsx';
import { preventWidows } from 'calypso/lib/formatting';
import type { ProductCardFeaturesItem } from './types';

interface Props {
	item: ProductCardFeaturesItem;
}

const JetpackProductCardFeaturesItem: React.FC< Props > = ( {
	item: { text, isHighlighted, isDifferentiator },
} ) => (
	<li
		className={ clsx( 'jetpack-product-card__features-item', {
			'is-highlighted': isHighlighted,
			'is-differentiator': isDifferentiator,
		} ) }
	>
		{ preventWidows( text ) }
	</li>
);

export default JetpackProductCardFeaturesItem;
