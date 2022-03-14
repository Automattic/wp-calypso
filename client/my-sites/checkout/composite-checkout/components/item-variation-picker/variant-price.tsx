import { useMobileBreakpoint } from '@automattic/viewport-react';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import type { WPCOMProductVariant } from './types';

const Discount = styled.span`
	color: ${ ( props ) => props.theme.colors.discount };
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}

	@media ( max-width: 660px ) {
		width: 100%;
	}
`;

const DoNotPayThis = styled.del`
	text-decoration: line-through;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const Variant = styled.div`
	display: flex;
	width: 100%;
	justify-content: space-between;
`;

const Label = styled.span`
	display: flex;
	// MOBILE_BREAKPOINT is <480px, used in useMobileBreakpoint
	@media ( max-width: 480px ) {
		flex-direction: column;
	}
`;

interface Props {
	variant: WPCOMProductVariant;
}

const DiscountPercentage: FunctionComponent< { percent: number } > = ( { percent } ) => {
	const translate = useTranslate();
	return (
		<Discount>
			{ translate( 'Save %(percent)s%%', {
				args: {
					percent,
				},
			} ) }
		</Discount>
	);
};

export const ItemVariantPrice: FunctionComponent< Props > = ( { variant } ) => {
	const isMobile = useMobileBreakpoint();

	return (
		<Variant>
			<Label>
				{ variant.variantLabel }
				{ variant.discountPercentage > 0 && isMobile && (
					<DiscountPercentage percent={ variant.discountPercentage } />
				) }
			</Label>
			<span>
				{ variant.discountPercentage > 0 && ! isMobile && (
					<DiscountPercentage percent={ variant.discountPercentage } />
				) }
				{ variant.discountPercentage > 0 && (
					<DoNotPayThis>{ variant.formattedPriceBeforeDiscount }</DoNotPayThis>
				) }
				{ variant.formattedCurrentPrice }
			</span>
		</Variant>
	);
};
