/**
 * External dependencies
 */
import { isObject } from 'lodash';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Type dependencies
 */
import type { ProductCardFeaturesItem } from './types';

export type Props = {
	item: ProductCardFeaturesItem;
};

type IconComponent = FunctionComponent< { icon: string; className?: string } >;

const DEFAULT_ICON = 'checkmark';

const JetpackProductCardFeaturesItem: FunctionComponent< Props > = ( { item } ) => {
	const { icon, text, description, subitems } = item;
	const iconName = ( isObject( icon ) ? icon?.icon : icon ) || DEFAULT_ICON;
	const Icon = ( ( isObject( icon ) && icon?.component ) || Gridicon ) as IconComponent;

	return (
		<li className="jetpack-product-card-alt__features-item">
			<div className="jetpack-product-card-alt__features-main">
				<div className="jetpack-product-card-alt__features-summary">
					<Icon className="jetpack-product-card-alt__features-icon" icon={ iconName } />
					<p className="jetpack-product-card-alt__features-text">{ preventWidows( text ) }</p>
				</div>
				{ description && <InfoPopover>{ preventWidows( description ) }</InfoPopover> }
			</div>
			{ subitems && subitems?.length > 0 && (
				<ul className="jetpack-product-card-alt__features-subitems">
					{ subitems.map( ( subitem, index ) => (
						<JetpackProductCardFeaturesItem key={ index } item={ subitem } />
					) ) }
				</ul>
			) }
		</li>
	);
};

export default JetpackProductCardFeaturesItem;
