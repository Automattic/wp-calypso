import { useShoppingCart } from '@automattic/shopping-cart';
import { Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useAnalytics } from '../analytics';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-shopping-cart.scss';

const OmnibarShoppingCartPanel = lazy(
	() =>
		import( /* webpackChunkName: "async-omnibar-shopping-cart" */ './omnibar-shopping-cart-panel' )
);

function CartIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path d="M9,20c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S9,18.9,9,20z M17,18c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S18.1,18,17,18z M17.4,13c0.9,0,1.7-0.7,2-1.6L21,5H7V4c0-1.1-0.9-2-2-2H3v2h2v1v8v2c0,1.1,0.9,2,2,2h12c0-1.1-0.9-2-2-2H7v-2H17.4z" />
			<circle className="omnibar__cart-dot" cx="20" cy="3" r="3.7" />
		</svg>
	);
}

function ShoppingCartPanel( {
	siteId,
	siteSlug,
	anchor,
	onClose,
}: {
	siteId: number;
	siteSlug: string;
	anchor: HTMLElement;
	onClose: () => void;
} ) {
	return (
		<Popover
			className="omnibar__cart-popover"
			anchor={ anchor }
			placement="bottom-end"
			offset={ 0 }
			onClose={ onClose }
			onFocusOutside={ () => {
				const omnibar = document.getElementById( 'wpcom-omnibar' );
				if ( ! omnibar?.contains( document.activeElement ) ) {
					onClose();
				}
			} }
		>
			<Suspense fallback={ null }>
				<OmnibarShoppingCartPanel siteId={ siteId } siteSlug={ siteSlug } onClose={ onClose } />
			</Suspense>
		</Popover>
	);
}

export function useShoppingCartPlugin( { site }: { site?: Site } ): {
	node?: OmnibarNode;
	panel?: React.ReactNode;
} {
	const { recordTracksEvent } = useAnalytics();
	const { responseCart, reloadFromServer } = useShoppingCart( site?.ID );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );
	const hasProducts = responseCart.products.length > 0;

	const anchorRef = useCallback( ( icon: HTMLSpanElement | null ) => {
		setAnchor( icon?.closest( 'button' ) ?? null );
	}, [] );

	useEffect( () => {
		if ( hasProducts ) {
			recordTracksEvent( 'calypso_masterbar_cart_shown' );
		} else {
			setIsOpen( false );
		}
	}, [ hasProducts, recordTracksEvent ] );

	if ( ! hasProducts || ! site ) {
		return {};
	}

	return {
		node: {
			id: 'shopping-cart',
			className: 'omnibar__cart',
			label: __( 'My shopping cart' ),
			icon: (
				<span ref={ anchorRef } className="omnibar__cart-icon">
					<CartIcon />
				</span>
			),
			onClick: () => {
				if ( ! isOpen ) {
					recordTracksEvent( 'calypso_masterbar_cart_open' );
					reloadFromServer().catch( () => {} );
				}
				setIsOpen( ! isOpen );
			},
		},
		panel: isOpen && anchor && (
			<ShoppingCartPanel
				siteId={ site.ID }
				siteSlug={ site.slug }
				anchor={ anchor }
				onClose={ () => setIsOpen( false ) }
			/>
		),
	};
}
