import * as React from 'react';
import CalypsoShoppingCartProvider from './calypso-shopping-cart-provider';

export default function withCalypsoShoppingCartProvider< P >(
	Component: React.ComponentType< P >
) {
	return function CalypsoShoppingCartProviderWrapper( props: P ): JSX.Element {
		return (
			<CalypsoShoppingCartProvider>
				<Component { ...props } />
			</CalypsoShoppingCartProvider>
		);
	};
}
