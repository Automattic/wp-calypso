/**
 * External dependencies
 */
import classNames from 'classnames';
import { isObject } from 'lodash';
import React, { FunctionComponent, useState, useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import FeaturesProductSlideOut from './features-product-slide-out';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';
import { slugToSelectorProduct } from 'calypso/my-sites/plans-v2/utils';
import {
	FEATURE_TO_PRODUCT_ALT_V2,
	FEATURE_TO_MONTHLY_PRODUCT_ALT_V2,
} from 'calypso/my-sites/plans-v2/constants';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';

/**
 * Type dependencies
 */
import type { ProductCardFeaturesItem } from './types';
import type { Duration, PurchaseCallback } from 'calypso/my-sites/plans-v2/types';

export type Props = {
	item: ProductCardFeaturesItem;
	billingTerm: Duration;
	onProductClick: PurchaseCallback;
};

type IconComponent = FunctionComponent< { icon: string; className?: string } >;

const DEFAULT_ICON = 'checkmark';

const JetpackProductCardFeaturesItem: FunctionComponent< Props > = ( {
	item,
	billingTerm,
	onProductClick,
} ) => {
	const { icon, text, description, isHighlighted: hasProductSlideout, slug } = item;
	const iconName = ( isObject( icon ) ? icon?.icon : icon ) || DEFAULT_ICON;
	const Icon = ( ( isObject( icon ) && icon?.component ) || Gridicon ) as IconComponent;
	const translate = useTranslate();

	const useOpenClose = () => {
		const [ isOpen, setIsOpen ] = useState( false );

		const close = useCallback( () => {
			setIsOpen( false );
		}, [ setIsOpen ] );

		const open = useCallback( () => {
			setIsOpen( true );
		}, [ setIsOpen ] );

		return { isOpen, open, close };
	};

	const slideOutProductSlug =
		billingTerm === 'TERM_ANNUALLY'
			? FEATURE_TO_PRODUCT_ALT_V2[ slug ]
			: FEATURE_TO_MONTHLY_PRODUCT_ALT_V2[ slug ];

	const slideOutProduct = slugToSelectorProduct( slideOutProductSlug );

	const { isOpen, open, close } = useOpenClose();
	const trackingProps = slideOutProductSlug ? { product_slug: slideOutProductSlug } : {};

	const trackSlideOutOpen = useTrackCallback(
		open,
		'calypso_product_slideout_open',
		trackingProps
	);
	const trackSlideOutClosed = useTrackCallback(
		close,
		'calypso_product_slideout_close',
		trackingProps
	);

	const renderFeatureAction = () => {
		if ( hasProductSlideout && slideOutProductSlug ) {
			return isOpen ? (
				<Button
					className="jetpack-product-card-alt-2__slideout-button is-borderless"
					onClick={ trackSlideOutClosed }
				>
					<span>{ translate( 'Close' ) }</span> <Gridicon icon="cross" size={ 18 } />
				</Button>
			) : (
				<Button
					className="jetpack-product-card-alt-2__slideout-button is-borderless is-open"
					onClick={ trackSlideOutOpen }
				>
					<span>{ preventWidows( translate( 'Learn more' ) ) }</span>{ ' ' }
					<Gridicon icon="chevron-down" size={ 18 } />
				</Button>
			);
		}
		return description && <InfoPopover>{ preventWidows( description ) }</InfoPopover>;
	};

	return (
		<li
			className={ classNames( 'jetpack-product-card-alt-2__features-item', {
				'is-highlighted': hasProductSlideout,
			} ) }
		>
			<div className="jetpack-product-card-alt-2__features-main">
				<div className="jetpack-product-card-alt-2__features-summary">
					<Icon className="jetpack-product-card-alt-2__features-icon" icon={ iconName } />
					<p className="jetpack-product-card-alt-2__features-text">{ preventWidows( text ) }</p>
				</div>
				{ renderFeatureAction() }
			</div>
			{ slideOutProduct && (
				<FeaturesProductSlideOut
					product={ slideOutProduct }
					productBillingTerm={ billingTerm }
					isOpen={ isOpen }
					onProductClick={ onProductClick }
				/>
			) }
		</li>
	);
};

export default JetpackProductCardFeaturesItem;
