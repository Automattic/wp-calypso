/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback } from 'react';

/**
 * Internal dependencies
 */
import FeaturesItem from './features-item';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';

/**
 * Type dependencies
 */
import type { ProductCardFeatures, ProductCardFeaturesItem } from './types';

/**
 * Styles dependencies
 */
import chevronIcon from './assets/chevron.svg';

export interface Props {
	features: ProductCardFeatures;
	showAllFeatures?: boolean;
	productSlug: string;
}

interface TrackProps {
	product_slug?: string;
}

const DEFAULT_ITEM_COUNT = 3;

const JetpackProductCardFeatures: React.FC< Props > = ( {
	features: { items },
	showAllFeatures,
	productSlug,
} ) => {
	const trackProps = {} as TrackProps;

	if ( productSlug ) {
		trackProps.product_slug = productSlug;
	}

	const translate = useTranslate();
	const [ isExpanded, setExpanded ] = useState( false );

	const trackShowFeatures = useTrackCallback(
		undefined,
		'calypso_product_features_open',
		trackProps
	);
	const trackHideFeatures = useTrackCallback(
		undefined,
		'calypso_product_features_close',
		trackProps
	);
	const onToggle = useCallback( () => {
		if ( isExpanded ) {
			trackHideFeatures();
			setExpanded( false );
		} else {
			trackShowFeatures();
			setExpanded( true );
		}
	}, [ isExpanded, setExpanded, trackShowFeatures, trackHideFeatures ] );

	return (
		<section
			className={ classNames( 'jetpack-product-card-i5__features', {
				'is-expanded': isExpanded,
			} ) }
		>
			<ul className="jetpack-product-card-i5__features-list">
				{ ( items.slice(
					0,
					isExpanded || showAllFeatures ? items.length : DEFAULT_ITEM_COUNT
				) as ProductCardFeaturesItem[] ).map( ( item, i ) => (
					<FeaturesItem key={ i } item={ item } />
				) ) }
			</ul>
			{ ! showAllFeatures && (
				<button className="jetpack-product-card-i5__features-toggle" onClick={ onToggle }>
					<span>
						{ isExpanded ? translate( 'Show less features' ) : translate( 'Show all features' ) }
					</span>
					<img className="jetpack-product-card-i5__features-chevron" src={ chevronIcon } alt="" />
				</button>
			) }
		</section>
	);
};

export default JetpackProductCardFeatures;
