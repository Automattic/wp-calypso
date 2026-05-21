import { localizeUrl } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { getTotalLineItemFromCart } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { Icon, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useId, useState } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSubmitButtonSlot } from '../lib/submit-button-slot';
import { WPCheckoutOrderSummary } from './wp-checkout-order-summary';

const LOCK_ICON =
	"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='4' y='11' width='16' height='10' rx='2'/><path d='M7 11V8a5 5 0 0 1 10 0v3'/></svg>\")";

const Wrapper = styled.div`
	position: fixed;
	inset-block-end: 0;
	inset-inline-start: 0;
	inset-inline-end: 0;
	z-index: 100;
	background: var( --color-surface );
	border-block-start: 1px solid rgba( 0, 0, 0, 0.08 );
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const Panel = styled.div`
	max-block-size: 70vh;
	overflow-y: auto;
	inline-size: 100%;

	&[hidden] {
		display: none;
	}

	/* Figma 2392:15321 — product-name + price typography for the line items
	   surfaced inside the sticky-summary panel. Scoped to this panel so the
	   rest of WPCheckoutOrderSummary's use sites are untouched. */
	.cost-overrides-list-product__title {
		font-size: 16px;
		font-weight: 500;
		line-height: 24px;
		letter-spacing: -0.32px;
		color: var( --studio-gray-100 );
	}

	.cost-overrides-list-product-wrapper s {
		font-size: 16px;
		font-weight: 400;
		line-height: 24px;
		letter-spacing: -0.32px;
		color: var( --studio-gray-50 );
		text-decoration: line-through;
	}

	.cost-overrides-list-product-wrapper > div > span:last-child > span {
		font-size: 16px;
		font-weight: 500;
		line-height: 24px;
		letter-spacing: -0.32px;
		color: var( --studio-gray-100 );
	}
`;

const ToggleRow = styled.button`
	appearance: none;
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	inline-size: 100%;
	color: var( --studio-gray-100 );
	font-size: 20px;
	font-weight: 500;
	line-height: 26px;
	letter-spacing: 0.38px;
	text-align: start;

	&:focus-visible {
		outline: 2px solid var( --color-primary );
		outline-offset: 2px;
		border-radius: 4px;
	}
`;

const ChevronWrapper = styled.span< { isOpen: boolean } >`
	flex-shrink: 0;
	display: inline-flex;
	color: var( --studio-gray-100 );
	transition: transform 200ms ease-out;
	transform: ${ ( props ) => ( props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)' ) };
`;

const SubmitSlot = styled.div`
	inline-size: 100%;

	.checkout-steps__submit-button-wrapper {
		padding: 0;
	}

	.checkout-submit-button,
	.checkout-submit-button button {
		width: 100%;
	}

	.checkout-submit-button > button svg {
		display: none;
	}

	.checkout-submit-button > button::before {
		content: '';
		display: inline-block;
		vertical-align: middle;
		inline-size: 16px;
		block-size: 16px;
		margin-inline-end: 8px;
		background: ${ LOCK_ICON } no-repeat center;
	}
`;

const TosWrapper = styled.div`
	inline-size: 100%;
	font-size: 12px;
	line-height: 20px;
	color: var( --studio-gray-50 );
	text-align: center;

	a,
	button {
		color: var( --studio-gray-100 );
		text-decoration: underline;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}
`;

export function MobileCheckoutStickySummary() {
	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const totalLineItem = getTotalLineItemFromCart( responseCart );
	const { setSlotEl } = useSubmitButtonSlot();
	const [ isOpen, setIsOpen ] = useState( false );
	const panelId = useId();

	return (
		<Wrapper>
			<Panel id={ panelId } hidden={ ! isOpen }>
				<WPCheckoutOrderSummary />
			</Panel>

			<ToggleRow
				type="button"
				onClick={ () => setIsOpen( ( value ) => ! value ) }
				aria-expanded={ isOpen }
				aria-controls={ panelId }
			>
				<span>
					{ translate( 'Total: %(amount)s', {
						args: { amount: totalLineItem.formattedAmount },
						comment: 'Total price shown in the mobile checkout sticky bar',
					} ) }
				</span>
				<ChevronWrapper isOpen={ isOpen } aria-hidden="true">
					<Icon icon={ chevronUp } size={ 24 } />
				</ChevronWrapper>
			</ToggleRow>

			<SubmitSlot ref={ setSlotEl } />

			<TosWrapper>
				{ translate( 'By continuing, you agree to our {{a}}Terms of Service{{/a}}.', {
					components: {
						a: (
							// eslint-disable-next-line jsx-a11y/anchor-has-content
							<a
								href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				} ) }
			</TosWrapper>
		</Wrapper>
	);
}
