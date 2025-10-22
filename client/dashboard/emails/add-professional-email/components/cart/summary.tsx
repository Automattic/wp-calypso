import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { _n, sprintf } from '@wordpress/i18n';

export const CartSummary = ( {
	totalItems,
	totalPrice,
}: {
	totalItems: number;
	totalPrice: string;
} ) => {
	const mailboxCount = sprintf(
		// translators: %(mailboxes)s is the number of mailboxes selected.
		_n( '%(mailboxes)s mailbox', '%(mailboxes)s mailboxes', totalItems ),
		{
			mailboxes: totalItems,
		}
	);

	return (
		<VStack spacing={ 2 } alignment="left">
			<Text size="footnote">{ mailboxCount }</Text>
			<Text className="cart-summary__total">{ totalPrice }</Text>
		</VStack>
	);
};
