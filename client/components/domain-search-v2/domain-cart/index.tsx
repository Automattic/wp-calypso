import {
	DomainsMiniCart,
	DomainsFullCart,
	DomainsFullCartItems,
	DomainsFullCartItem,
} from '@automattic/domain-search';
import {
	__experimentalVStack as VStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalView as View,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { ComponentProps } from 'react';
import { useDomainSearch } from '../__legacy/domain-search';
import { useFocusedCartAction } from '../__legacy/use-focused-cart-action';
import { FreeDomainForAYearPromo } from '../free-domain-for-a-year-promo';
import { ChooseDomainLater } from './choose-domain-later';
import { HundredYearPromo } from './hundred-year-promo';

import './style.scss';

interface Props {
	showFreeDomainPromo?: boolean;
	onSkip?: () => void;
}

const Item = ( { domain }: Pick< ComponentProps< typeof DomainsFullCartItem >, 'domain' > ) => {
	const { cart } = useDomainSearch();
	const { isBusy, errorMessage, removeErrorMessage, callback } = useFocusedCartAction( () => {
		cart.onRemoveItem( domain.uuid );
	} );

	return (
		<DomainsFullCartItem
			domain={ domain }
			disabled={ isBusy }
			isBusy={ isBusy }
			onRemove={ callback }
			errorMessage={ errorMessage ?? undefined }
			removeErrorMessage={ removeErrorMessage }
		/>
	);
};

export const DomainCartV2 = ( { showFreeDomainPromo = false, onSkip }: Props ) => {
	const hasDomainInCartEligibleFor100YearDomainUpgrade = false;
	const { cart, isFullCartOpen, closeFullCart, onContinue, openFullCart } = useDomainSearch();

	const totalItems = cart.items.length;
	const totalPrice = cart.total;

	return (
		<>
			<DomainsMiniCart
				className="domains-search-v2__mini-cart"
				isMiniCartOpen={ ! isFullCartOpen && totalItems > 0 }
				totalItems={ totalItems }
				totalPrice={ totalPrice }
				openFullCart={ openFullCart }
				onContinue={ onContinue }
				isCartBusy={ cart.isBusy }
			/>
			<DomainsFullCart
				className="domains-search-v2__full-cart"
				isFullCartOpen={ isFullCartOpen }
				closeFullCart={ closeFullCart }
				onContinue={ onContinue }
				isCartBusy={ cart.isBusy }
				totalItems={ totalItems }
				totalPrice={ totalPrice }
			>
				<VStack spacing={ 6 }>
					{ showFreeDomainPromo && <FreeDomainForAYearPromo textOnly /> }
					<DomainsFullCartItems>
						{ cart.items.map( ( item ) => (
							<Item key={ item.uuid } domain={ item } />
						) ) }
					</DomainsFullCartItems>
					{ onSkip && (
						<div>
							<ChooseDomainLater onSkip={ onSkip } />
						</div>
					) }
					{ hasDomainInCartEligibleFor100YearDomainUpgrade && (
						<View>
							<Spacer marginTop={ 4 }>
								<HundredYearPromo />
							</Spacer>
						</View>
					) }
				</VStack>
			</DomainsFullCart>
		</>
	);
};
