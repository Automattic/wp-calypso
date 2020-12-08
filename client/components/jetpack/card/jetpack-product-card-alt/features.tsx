/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback, FunctionComponent } from 'react';

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
import type {
	ProductCardFeatures,
	ProductCardFeaturesSection,
	ProductCardFeaturesItem,
} from 'calypso/components/jetpack/card/jetpack-product-card-alt-2/types';

export type Props = {
	className?: string;
	features: ProductCardFeatures;
	isExpanded?: boolean;
	productSlug?: string;
};

const JetpackProductCardFeatures: FunctionComponent< Props > = ( {
	className,
	features,
	isExpanded: isExpandedByDefault,
	productSlug,
} ) => {
	const trackProps = productSlug ? { product_slug: productSlug } : {};
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
	const [ isExpanded, setExpanded ] = useState( !! isExpandedByDefault );
	const onOpen = useCallback( () => {
		setExpanded( true );
		trackShowFeatures();
	}, [ setExpanded, trackShowFeatures ] );
	const onClose = useCallback( () => {
		setExpanded( false );
		trackHideFeatures();
	}, [ setExpanded, trackHideFeatures ] );
	const translate = useTranslate();

	const { items, more } = features;

	return (
		<FoldableCard
			className={ className }
			header={ isExpanded ? translate( 'Hide features' ) : translate( 'Show features' ) }
			clickableHeader
			expanded={ isExpanded }
			onOpen={ onOpen }
			onClose={ onClose }
		>
			<ul className="jetpack-product-card-alt__features-list">
				{ ( items as ( ProductCardFeaturesItem | ProductCardFeaturesSection )[] ).map(
					( item, i ) => {
						if ( 'heading' in item && 'list' in item ) {
							return (
								<li key={ i }>
									<p className="jetpack-product-card-alt__features-category">{ item.heading }</p>
									<ul className="jetpack-product-card-alt__features-list">
										{ item.list.map( ( subitem, j ) => (
											<FeaturesItem key={ j } item={ subitem } />
										) ) }
									</ul>
								</li>
							);
						}

						return <FeaturesItem key={ i } item={ item } />;
					}
				) }
			</ul>
			{ more && (
				<div className="jetpack-product-card-alt__feature-more">
					<ExternalLink icon={ true } href={ more.url }>
						{ more.label }
					</ExternalLink>
				</div>
			) }
		</FoldableCard>
	);
};

export default JetpackProductCardFeatures;
