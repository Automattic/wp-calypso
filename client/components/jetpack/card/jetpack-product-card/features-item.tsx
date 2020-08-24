/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import { preventWidows } from 'lib/formatting';

/**
 * Type dependencies
 */
import type { ProductCardFeaturesItem } from './types';

export type Props = {
	item: ProductCardFeaturesItem;
};

const DEFAULT_ICON = 'checkmark';

const JetpackProductCardFeaturesItem: FunctionComponent< Props > = ( { item } ) => {
	const { icon, text, description, subitems } = item;

	return (
		<li className="jetpack-product-card__features-item">
			<div className="jetpack-product-card__features-main">
				<div className="jetpack-product-card__features-summary">
					<Gridicon className="jetpack-product-card__features-icon" icon={ icon || DEFAULT_ICON } />
					<p className="jetpack-product-card__features-text">{ preventWidows( text ) }</p>
				</div>
				{ description && <InfoPopover>{ preventWidows( description ) }</InfoPopover> }
			</div>
			{ subitems && subitems?.length > 0 && (
				<ul className="jetpack-product-card__features-subitems">
					{ subitems.map( ( subitem, index ) => (
						<JetpackProductCardFeaturesItem key={ index } item={ subitem } />
					) ) }
				</ul>
			) }
		</li>
	);
};

export default JetpackProductCardFeaturesItem;
