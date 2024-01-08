import { Spinner } from '@automattic/components';
import { useEffect, useState } from 'react';

import './style.scss';

export type ThankYouProductProps = {
	name: string;
	details?: string;
	actions?: React.ReactNode;
	isLoading?: boolean;
};

const ThankYouProduct = ( {
	name,
	details,
	actions,
	isLoading = false,
}: ThankYouProductProps ) => {
	const [ shouldShowLoader, setShouldShowLoader ] = useState( isLoading );

	useEffect( () => {
		setShouldShowLoader( isLoading );
	}, [ isLoading ] );

	return (
		<li className="checkout-thank-you__product">
			<div className="checkout-thank-you__product-info">
				{ shouldShowLoader ? (
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
