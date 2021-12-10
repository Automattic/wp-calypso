import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import FeaturesItem from './features-item';
import type { ProductCardFeatures, ProductCardFeaturesItem } from './types';

export interface Props {
	className?: string;
	features: ProductCardFeatures;
	collapseFeaturesOnMobile?: boolean;
}

const JetpackProductCardFeatures: React.FC< Props > = ( {
	className,
	features: { items },
	collapseFeaturesOnMobile,
} ) => {
	const translate = useTranslate();
	const [ isExpanded, expand ] = useState( ! collapseFeaturesOnMobile );

	const onClick = useCallback( () => expand( ! isExpanded ), [ expand, isExpanded ] );
	const onKeyPress = useCallback(
		( { code } ) => {
			if ( code === 'Enter' ) {
				expand( ! isExpanded );
			}
		},
		[ expand, isExpanded ]
	);

	return (
		<section className={ classnames( className, 'jetpack-product-card__features' ) }>
			{ collapseFeaturesOnMobile && (
				<header
					className="jetpack-product-card__features-header"
					role="button"
					tabIndex={ 0 }
					onClick={ onClick }
					onKeyPress={ onKeyPress }
				>
					<span>{ translate( 'Features include' ) }</span>
					<Gridicon icon={ `chevron-${ isExpanded ? 'up' : 'down' }` } size={ 18 } />
				</header>
			) }
			<ul
				className={ classnames( className, 'jetpack-product-card__features-list', {
					'is-collapsed': ! isExpanded,
				} ) }
			>
				{ ( items as ProductCardFeaturesItem[] ).map( ( item, i ) => (
					<FeaturesItem key={ i } item={ item } />
				) ) }
			</ul>
		</section>
	);
};

export default JetpackProductCardFeatures;
