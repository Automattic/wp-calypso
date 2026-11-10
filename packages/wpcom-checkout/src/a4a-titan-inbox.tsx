import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import type { Theme } from '@automattic/composite-checkout';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Order details for the A4A Pressable Titan inbox add-on.
 *
 * The WordPress.com backend prepares this cart and owns every billing rule.
 * This module only reads the domain and inbox quantities off the product so
 * checkout can say what is being bought; prices, the trial and renewal terms
 * are shown by the regular checkout totals and terms of service.
 */

export function isA4ATitanInboxProduct( product: ResponseCartProduct ): boolean {
	return typeof product.extra?.titan_domain === 'string' && product.extra.titan_domain !== '';
}

export interface A4ATitanInboxTerms {
	domain: string;
	currentQuantity: number;
	additionalQuantity: number;
	resultingQuantity: number;
}

export function getA4ATitanInboxTerms( product: ResponseCartProduct ): A4ATitanInboxTerms {
	const currentQuantity = product.current_quantity ?? 0;
	const resultingQuantity = product.quantity ?? currentQuantity;

	return {
		domain: product.extra?.titan_domain ?? '',
		currentQuantity,
		additionalQuantity: Math.max( 0, resultingQuantity - currentQuantity ),
		resultingQuantity,
	};
}

const Meta = styled.div< { theme?: Theme; compact?: boolean } >`
	color: ${ ( props ) => props.theme?.colors?.textColorLight };
	font-size: ${ ( props ) => ( props.compact ? 'inherit' : '14px' ) };
	overflow-wrap: anywhere;
	width: 100%;
`;

/**
 * Domain and inbox quantities read from the prepared cart product.
 */
export function A4ATitanInboxMeta( {
	product,
	compact = false,
}: {
	product: ResponseCartProduct;
	compact?: boolean;
} ) {
	const translate = useTranslate();
	const terms = getA4ATitanInboxTerms( product );
	const quantity =
		terms.currentQuantity > 0
			? translate(
					'Adding %(added)d inbox · %(total)d inboxes total',
					'Adding %(added)d inboxes · %(total)d inboxes total',
					{
						count: terms.additionalQuantity,
						args: { added: terms.additionalQuantity, total: terms.resultingQuantity },
						textOnly: true,
					}
				)
			: translate( '%(total)d inbox', '%(total)d inboxes', {
					count: terms.resultingQuantity,
					args: { total: terms.resultingQuantity },
					textOnly: true,
				} );

	return (
		<div className="a4a-titan-inbox-meta">
			<Meta compact={ compact }>{ `${ terms.domain } · ${ quantity }` }</Meta>
		</div>
	);
}
