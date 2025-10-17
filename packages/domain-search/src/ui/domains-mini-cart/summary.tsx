import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

export const DomainsMiniCartSummary = ( {
	totalItems,
	totalPrice,
	openFullCart,
}: {
	totalItems: number;
	totalPrice: string;
	openFullCart: () => void;
} ) => {
	const { _n } = useI18n();

	const domainCount = sprintf(
		// translators: %(domains)s is the number of domains selected.
		_n( '%(domains)s domain', '%(domains)s domains', totalItems ),
		{
			domains: totalItems,
		}
	);

	const ariaLabel = sprintf(
		// translators: %(domains)s is the number of domains selected. %(total)s is the total price of the domains in the cart.
		_n(
			'%(domains)s domain selected. %(total)s total price. Click to view the cart',
			'%(domains)s domains selected. %(total)s total price. Click to view the cart',
			totalItems
		),
		{
			domains: totalItems,
			total: totalPrice,
		}
	);

	return (
		<Button onClick={ openFullCart } aria-label={ ariaLabel } className="domains-mini-cart-summary">
			<VStack spacing={ 2 } alignment="left">
				<Text size="footnote">{ domainCount }</Text>
				<Text className="domains-mini-cart-summary__total">{ totalPrice }</Text>
			</VStack>
		</Button>
	);
};
