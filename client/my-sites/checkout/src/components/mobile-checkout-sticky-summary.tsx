import { localizeUrl } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { getTotalLineItemFromCart } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { Icon, chevronUp, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useId, useState } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSubmitButtonSlot } from '../lib/submit-button-slot';
import { WPCheckoutOrderSummary } from './wp-checkout-order-summary';

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
		color: var( --studio-gray-100 );
	}

	.cost-overrides-list-product-wrapper s {
		font-size: 16px;
		font-weight: 400;
		line-height: 24px;
		color: var( --studio-gray-50 );
		text-decoration: line-through;
	}

	.cost-overrides-list-product-wrapper > div > span:last-child > span {
		font-size: 16px;
		font-weight: 500;
		line-height: 24px;
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

const SubmitRow = styled.div`
	inline-size: 100%;
	position: relative;
	display: flex;
	align-items: center;

	.checkout-steps__submit-button-wrapper {
		padding: 0;
		inline-size: 100%;
	}

	.checkout-submit-button,
	.checkout-submit-button button {
		width: 100%;
	}

	.checkout-submit-button > button {
		padding-inline-start: 40px;
	}

	.checkout-submit-button > button svg {
		display: none;
	}
`;

const LockIconWrapper = styled.span`
	position: absolute;
	inset-inline-start: 12px;
	display: inline-flex;
	align-items: center;
	pointer-events: none;
	color: currentColor;
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

			<SubmitRow>
				<LockIconWrapper aria-hidden="true">
					<Icon icon={ lock } size={ 16 } />
				</LockIconWrapper>
				<div ref={ setSlotEl } style={ { width: '100%' } } />
			</SubmitRow>

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
