import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { MasterbarCartButton, MasterbarCartButtonProps } from './masterbar-cart-button';

export default function MasterbarCartWrapper( props: MasterbarCartButtonProps ): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<MasterbarCartButton { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
