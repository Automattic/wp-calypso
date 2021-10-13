import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { MasterbarCart, MasterbarCartProps } from './masterbar-cart';

export default function MasterbarCartWrapper( props: MasterbarCartProps ): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<MasterbarCart { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
