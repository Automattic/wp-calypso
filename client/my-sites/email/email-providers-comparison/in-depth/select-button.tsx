import { Button } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { hasDomainInCart } from 'calypso/lib/cart-values/cart-items';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import { useSelector } from 'calypso/state';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { SelectButtonProps } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';

const usePlanAvailable = (
	emailProviderSlug: string,
	intervalLength: IntervalLength,
	isDomainInCart: boolean,
	selectedDomainName: string
) => {
	const selectedSite = useSelector( getSelectedSite );
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} );

	const canPurchaseGSuite = useSelector( canUserPurchaseGSuite );

	if ( emailProviderSlug !== GOOGLE_WORKSPACE_PRODUCT_TYPE ) {
		return true;
	}

	if ( ! canPurchaseGSuite ) {
		return false;
	}

	if ( isDomainInCart ) {
		return true;
	}

	return domain && hasGSuiteSupportedDomain( [ domain ] );
};

const SelectButton = ( {
	className,
	emailProviderSlug,
	intervalLength,
	onSelectEmailProvider,
	selectedDomainName,
}: SelectButtonProps ) => {
	const translate = useTranslate();

	const cartKey = useCartKey();
	const shoppingCartManager = useShoppingCart( cartKey );
	const isDomainInCart = hasDomainInCart( shoppingCartManager.responseCart, selectedDomainName );

	const isPlanAvailable = usePlanAvailable(
		emailProviderSlug,
		intervalLength,
		isDomainInCart,
		selectedDomainName
	);

	return (
		<Button
			className={ className }
			disabled={ ! isPlanAvailable }
			onClick={ () => onSelectEmailProvider( emailProviderSlug ) }
			primary
		>
			{ translate( 'Select' ) }
		</Button>
	);
};

export default SelectButton;
