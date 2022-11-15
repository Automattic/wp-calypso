import { Button } from '@wordpress/components';
import { FunctionComponent } from 'react';

interface Props {
	href: string;
}

const BillingButton: FunctionComponent< Props > = ( { href, children } ) => {
	return (
		<Button className="wp-block-a8c-pricing-plans__detail-cta" href={ href } isPrimary>
			{ children }
		</Button>
	);
};

export default BillingButton;
