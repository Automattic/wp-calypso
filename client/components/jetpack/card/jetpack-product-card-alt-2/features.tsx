/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect, useCallback, FunctionComponent, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import FoldableCard from 'calypso/components/foldable-card';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import FeaturesItem from './features-item';

/**
 * Type dependencies
 */
import type { ProductCardFeatures, ProductCardFeaturesItem } from './types';
import type { Duration, PurchaseCallback } from 'calypso/my-sites/plans/jetpack-plans/types';

export type Props = {
	className?: string;
	features: ProductCardFeatures;
	billingTerm: Duration;
	isExpanded?: boolean;
	productSlug?: string;
	ctaElt: ReactNode;
	onFeaturesToggle?: () => void;
	onButtonClick: PurchaseCallback;
};

const JetpackProductCardFeatures: FunctionComponent< Props > = ( {
	className,
	features,
	isExpanded: isExpandedByDefault,
	productSlug,
	billingTerm,
	ctaElt,
	onFeaturesToggle,
	onButtonClick,
} ) => {
	const trackProps = productSlug ? { product_slug: productSlug } : {};

	const [ isExpanded, setExpanded ] = useState( !! isExpandedByDefault );

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

	const onOpen = useCallback( () => {
		trackShowFeatures();

		if ( onFeaturesToggle ) {
			onFeaturesToggle();
		} else {
			setExpanded( true );
		}
	}, [ setExpanded, trackShowFeatures, onFeaturesToggle ] );
	const onClose = useCallback( () => {
		trackHideFeatures();

		if ( onFeaturesToggle ) {
			onFeaturesToggle();
		} else {
			setExpanded( false );
		}
	}, [ setExpanded, trackHideFeatures, onFeaturesToggle ] );

	const translate = useTranslate();

	const { items, more } = features;

	useEffect( () => setExpanded( !! isExpandedByDefault ), [ isExpandedByDefault ] );

	return (
		<FoldableCard
			className={ className }
			header={ isExpanded ? translate( 'Hide features' ) : translate( 'Show features' ) }
			clickableHeader
			expanded={ isExpanded }
			onOpen={ onOpen }
			onClose={ onClose }
		>
			<div>
				<ul className="jetpack-product-card-alt-2__features-list">
					{ ( items as ProductCardFeaturesItem[] ).map( ( item, i ) => (
						<FeaturesItem
							key={ i }
							item={ item }
							billingTerm={ billingTerm }
							onProductClick={ onButtonClick }
						/>
					) ) }
				</ul>
				{ more && (
					<div className="jetpack-product-card-alt-2__feature-more">
						<ExternalLink icon href={ more.url }>
							{ more.label }
						</ExternalLink>
					</div>
				) }
			</div>
			<div className="jetpack-product-card-alt-2__feature-cta">{ ctaElt }</div>
		</FoldableCard>
	);
};

export default JetpackProductCardFeatures;
