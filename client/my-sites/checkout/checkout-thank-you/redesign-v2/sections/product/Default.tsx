import { Spinner } from '@automattic/components';
import { useEffect, useState } from 'react';

export type ThankYouProductProps = {
	name: string;
	details?: string;
	actions?: React.ReactNode;
	isProductLoading?: boolean;
};

const ThankYouProduct = ( {
	name,
	details,
	actions,
	isProductLoading = false,
}: ThankYouProductProps ) => {
	const [ isLoading, setIsLoading ] = useState( false );

	useEffect( () => {
		setIsLoading( isProductLoading );
	}, [ isProductLoading ] );

	return (
		<li className="checkout-thank-you__product">
			<div className="checkout-thank-you__product-info">
				{ isLoading ? (
					<Spinner />
				) : (
					<>
						<div className="checkout-thank-you__product-name">{ name }</div>
						<div className="checkout-thank-you__product-details">{ details }</div>
					</>
				) }
			</div>
			{ actions && <div className="checkout-thank-you__product-actions">{ actions }</div> }
		</li>
	);
};

export default ThankYouProduct;
