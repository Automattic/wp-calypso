import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useRef, useEffect } from 'react';
import FeaturesItem from './features-item';
import type { ProductCardFeatures, ProductCardFeaturesItem } from './types';

export interface Props {
	className?: string;
	productSlug?: string;
	features: ProductCardFeatures;
	collapseFeaturesOnMobile?: boolean;
}

const JetpackProductCardFeatures: React.FC< Props > = ( {
	className,
	productSlug,
	features: { items },
	collapseFeaturesOnMobile,
} ) => {
	const translate = useTranslate();
	const listRef = useRef< HTMLUListElement >( null );
	const [ isExpanded, expand ] = useState( ! collapseFeaturesOnMobile );
	const listId = `${ productSlug }-features-list`;

	const focusOnList = useCallback( () => listRef.current?.focus?.(), [ listRef ] );
	const onClick = useCallback( () => expand( ! isExpanded ), [ expand, isExpanded ] );

	useEffect( () => {
		if ( collapseFeaturesOnMobile && isExpanded ) {
			focusOnList();
		}
	}, [ collapseFeaturesOnMobile, isExpanded, focusOnList ] );

	return (
		<section className={ clsx( className, 'jetpack-product-card__features' ) }>
			{ collapseFeaturesOnMobile && (
				<button
					className="jetpack-product-card__features-button"
					onClick={ onClick }
					aria-controls={ listId }
					aria-expanded={ isExpanded }
				>
					<span>{ translate( 'Features include' ) }</span>
					<Gridicon icon={ `chevron-${ isExpanded ? 'up' : 'down' }` } size={ 18 } />
				</button>
			) }
			<ul
				id={ listId }
				className={ clsx( className, 'jetpack-product-card__features-list', {
					'is-collapsed': ! isExpanded,
				} ) }
				tabIndex={ -1 }
				ref={ listRef }
			>
				{ ( items as ProductCardFeaturesItem[] ).map( ( item, i ) => (
					<FeaturesItem key={ i } item={ item } />
				) ) }
			</ul>
		</section>
	);
};

export default JetpackProductCardFeatures;
