/**
 * External dependencies
 */
import React, { useState } from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { useLocalize } from '../lib/localize'; // TODO: remove this
import { useLineItems } from '../public-api';
import Button from './button';
import Coupon from './coupon';

export default function WPCheckoutOrderSummary() {
	const localize = useLocalize();
	const [ items ] = useLineItems();
	//TODO: tie the default coupon field visibility based on whether there is a coupon in the cart
	const [ isCouponFieldVisible, setIsCouponFieldVisible ] = useState( false );
	const [ hasCouponBeenApplied, setHasCouponBeenApplied ] = useState( false );

	return (
		<React.Fragment>
			<SummaryContent>
				<ProductList>
					{ items.map( product => {
						return <ProductListItem key={ product.id }>{ product.label }</ProductListItem>;
					} ) }
				</ProductList>

				{ ! hasCouponBeenApplied && ! isCouponFieldVisible && (
					<AddCouponButton
						buttonState="text-button"
						onClick={ () => {
							setIsCouponFieldVisible( true );
						} }
					>
						{ localize( 'Add a coupon' ) }
					</AddCouponButton>
				) }
			</SummaryContent>

			<CouponField
				id="order-summary-coupon"
				isCouponFieldVisible={ isCouponFieldVisible }
				couponAdded={ () => {
					handleCouponAdded( setIsCouponFieldVisible, setHasCouponBeenApplied );
				} }
			/>
		</React.Fragment>
	);
}

const SummaryContent = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
`;

const ProductList = styled.ul`
	margin: 0;
	padding: 0;
`;

const ProductListItem = styled.li`
	margin: 0;
	padding: 0;
	list-style-type: none;
`;

const CouponField = styled( Coupon )`
	margin-top: 16px;
`;

const AddCouponButton = styled( Button )`
	font-size: ${props => props.theme.fontSize.small};
`;

function handleCouponAdded( setIsCouponFieldVisible, setHasCouponBeenApplied ) {
	setIsCouponFieldVisible( false );
	setHasCouponBeenApplied( true );
}
