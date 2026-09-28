import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import type { ProductPriceInfo } from './lib/product-pricing';

interface Props {
	priceInfo: ProductPriceInfo;
	currency: string;
	size?: 'default' | 'large';
}

export default function ProductPrice( { priceInfo, currency, size = 'default' }: Props ) {
	if ( priceInfo.isFree ) {
		return (
			<Text weight={ 600 } size={ size === 'large' ? 24 : undefined }>
				{ __( 'Free' ) }
			</Text>
		);
	}

	return (
		<HStack spacing={ 2 } justify="flex-start" alignment="baseline" wrap expanded={ false }>
			<Text weight={ 600 } size={ size === 'large' ? 24 : undefined }>
				{ formatCurrency( priceInfo.price, currency ) }
			</Text>
			{ priceInfo.regularPrice !== undefined && (
				<Text variant="muted">
					<s>{ formatCurrency( priceInfo.regularPrice, currency ) }</s>
				</Text>
			) }
			<Text variant="muted">{ priceInfo.intervalLabel }</Text>
			{ priceInfo.discountPercentage > 0 && (
				<Badge intent="stable">
					{ sprintf(
						/* translators: %d is the discount percentage. */
						__( 'Save %d%%' ),
						priceInfo.discountPercentage
					) }
				</Badge>
			) }
		</HStack>
	);
}
