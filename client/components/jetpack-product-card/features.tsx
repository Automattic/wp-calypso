/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { isArray, isObject } from 'lodash';
import React, { useState, useCallback, FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import FoldableCard from 'components/foldable-card';
import FeaturesItem from './features-item';
import { Features } from './types';

export type Props = {
	features: Features;
	isExpanded?: boolean;
};

const JetpackProductCardFeatures: FunctionComponent< Props > = ( {
	features,
	isExpanded: isExpandedByDefault,
} ) => {
	const [ isExpanded, setExpanded ] = useState( !! isExpandedByDefault );
	const onOpen = useCallback( () => setExpanded( true ), [ setExpanded ] );
	const onClose = useCallback( () => setExpanded( false ), [ setExpanded ] );
	const translate = useTranslate();

	const { items, more } = features;

	let itemsEl;

	if ( isArray( items ) ) {
		itemsEl = items.map( ( item ) => <FeaturesItem item={ item } key={ item.text } /> );
	} else if ( isObject( items ) ) {
		itemsEl = Object.keys( items ).map( ( category ) => (
			<li key={ category }>
				<p className="jetpack-product-card__features-category">{ category }</p>
				<ul className="jetpack-product-card__features-list">
					{ items[ category ].map( ( item ) => (
						<FeaturesItem item={ item } key={ item.text } />
					) ) }
				</ul>
			</li>
		) );
	}

	return (
		<FoldableCard
			header={ isExpanded ? translate( 'Hide features' ) : translate( 'Show features' ) }
			clickableHeader
			expanded={ isExpanded }
			onOpen={ onOpen }
			onClose={ onClose }
		>
			<ul className="jetpack-product-card__features-list">{ itemsEl }</ul>
			{ more && (
				<div className="jetpack-product-card__feature-more">
					<ExternalLink icon={ true } href={ more.url }>
						{ more.label }
					</ExternalLink>
				</div>
			) }
		</FoldableCard>
	);
};

export default JetpackProductCardFeatures;
