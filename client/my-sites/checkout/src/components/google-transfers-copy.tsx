import { isDomainTransfer } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import type { ResponseCart } from '@automattic/shopping-cart';

const GoogleDomainsCopyStyle = styled.p`
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };
	margin: 0 0 16px;
`;

export function GoogleDomainsCopy( { responseCart }: { responseCart: ResponseCart } ) {
	const { __ } = useI18n();

	const hasFreeCouponTransfersOnly = responseCart.products?.every( ( item ) => {
		return (
			( isDomainTransfer( item ) &&
				item.is_sale_coupon_applied &&
				item.item_subtotal_integer === 0 ) ||
			'wordpress-com-credits' === item.product_slug
		);
	} );

	if ( hasFreeCouponTransfersOnly ) {
		const couponText = __(
			'We’re paying to extend your registration for an additional year. We’ll use the payment information below to renew your domain before it expires.'
		);

		return <GoogleDomainsCopyStyle>{ couponText }</GoogleDomainsCopyStyle>;
	}
	return null;
}
