import * as React from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import type { ProductCardFeaturesItem } from './types';

interface Props {
	item: ProductCardFeaturesItem;
}

const JetpackProductCardFeaturesItem: React.FC< Props > = ( { item: { text } } ) => (
	<li className="jetpack-product-card__features-item">{ preventWidows( text ) }</li>
);

export default JetpackProductCardFeaturesItem;
